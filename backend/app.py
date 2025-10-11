import os
import io
from datetime import datetime

from flask import Flask, jsonify, request, abort, render_template, send_file
from flask_cors import CORS
from sqlalchemy import create_engine, or_
from sqlalchemy.orm import sessionmaker

from models import Base, Clip

# Configuration
DATABASE_URL = os.getenv("DATABASE_URL", "sqlite:///quickclip.db")
engine = create_engine(DATABASE_URL, connect_args={"check_same_thread": False})
Base.metadata.create_all(engine)
Session = sessionmaker(bind=engine)

# App setup
app = Flask(__name__, template_folder="templates", static_folder="static")
CORS(app)


def clip_to_dict(c):
    return {
        "id": c.id,
        "kind": c.kind,
        "title": c.title,
        "content": c.content,
        "url": c.url,
        "tags": c.tags,
        "created_at": c.created_at.isoformat() if c.created_at else None,
        "updated_at": c.updated_at.isoformat() if c.updated_at else None,
    }


# API routes
@app.route("/api/clips", methods=["GET"])
def list_clips():
    q = (request.args.get("q") or "").strip()
    tag = (request.args.get("tag") or "").strip()
    kind = (request.args.get("kind") or "").strip()
    page = int(request.args.get("page") or 1)
    per_page = int(request.args.get("per_page") or 100)

    session = Session()
    query = session.query(Clip)
    if q:
        like = f"%{q}%"
        query = query.filter(or_(Clip.title.ilike(like), Clip.content.ilike(like), Clip.tags.ilike(like)))
    if tag:
        tag_like = f"%{tag}%"
        query = query.filter(Clip.tags.ilike(tag_like))
    if kind in ("note", "bookmark"):
        query = query.filter(Clip.kind == kind)

    total = query.count()
    clips = query.order_by(Clip.updated_at.desc()).offset((page - 1) * per_page).limit(per_page).all()
    session.close()

    return jsonify({"total": total, "page": page, "per_page": per_page, "items": [clip_to_dict(c) for c in clips]})


@app.route("/api/clips", methods=["POST"])
def create_clip():
    data = request.get_json() or {}
    title = (data.get("title") or "").strip()
    if not title:
        abort(400, "Missing title")

    tags = ",".join([t.strip() for t in (data.get("tags") or "").split(",") if t.strip()])

    session = Session()
    clip = Clip(
        kind=data.get("kind", "note"),
        title=title,
        content=data.get("content", ""),
        url=data.get("url"),
        tags=tags,
    )
    session.add(clip)
    session.commit()
    result = clip_to_dict(clip)
    session.close()
    return jsonify(result), 201


@app.route("/api/clips/<int:clip_id>", methods=["PUT"])
def update_clip(clip_id):
    data = request.get_json() or {}
    session = Session()
    clip = session.query(Clip).get(clip_id)
    if not clip:
        session.close()
        abort(404)

    if "title" in data:
        if not (data.get("title") or "").strip():
            session.close()
            abort(400, "Title cannot be empty")
        clip.title = data["title"].strip()
    if "content" in data:
        clip.content = data.get("content", clip.content)
    if "url" in data:
        clip.url = data.get("url", clip.url)
    if "tags" in data:
        clip.tags = ",".join([t.strip() for t in (data.get("tags") or clip.tags).split(",") if t.strip()])

    session.commit()
    result = clip_to_dict(clip)
    session.close()
    return jsonify(result)


@app.route("/api/clips/<int:clip_id>", methods=["DELETE"])
def delete_clip(clip_id):
    session = Session()
    clip = session.query(Clip).get(clip_id)
    if not clip:
        session.close()
        abort(404)
    session.delete(clip)
    session.commit()
    session.close()
    return "", 204


@app.route("/api/tags", methods=["GET"])
def list_tags():
    session = Session()
    items = session.query(Clip.tags).all()
    session.close()
    counts = {}
    for (tagstr,) in items:
        if not tagstr:
            continue
        for tag in [t.strip() for t in tagstr.split(",") if t.strip()]:
            counts[tag] = counts.get(tag, 0) + 1
    result = [{"tag": k, "count": v} for k, v in sorted(counts.items(), key=lambda x: -x[1])]
    return jsonify(result)


@app.route("/api/export", methods=["GET"])
def export_all():
    session = Session()
    clips = session.query(Clip).order_by(Clip.updated_at.desc()).all()
    data = [clip_to_dict(c) for c in clips]
    session.close()
    return jsonify(data)


# Server-side PDF export (WeasyPrint)
@app.route("/api/export/pdf", methods=["GET"])
def export_pdf():
    session = Session()
    clips = session.query(Clip).order_by(Clip.updated_at.desc()).all()
    data = [clip_to_dict(c) for c in clips]
    exported_at = datetime.utcnow().isoformat()
    session.close()

    html = render_template("export_template.html", clips=data, exported_at=exported_at)

    try:
        from weasyprint import HTML
    except Exception as e:
        return ("WeasyPrint is not available: " + str(e)), 500

    pdf_bytes = HTML(string=html).write_pdf()
    return send_file(io.BytesIO(pdf_bytes), mimetype="application/pdf", download_name=f"clips_export_{exported_at}.pdf")


if __name__ == "__main__":
    app.run(debug=True, port=int(os.getenv("PORT", 5000)))
