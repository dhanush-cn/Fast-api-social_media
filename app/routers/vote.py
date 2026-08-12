# app/routers/vote.py
from .. import models, schemas, oauth2
from fastapi import status, HTTPException, Depends, APIRouter
from sqlalchemy.orm import Session
from sqlalchemy import func
from ..database import get_db

router = APIRouter(prefix="/vote", tags=["Vote"])

@router.post("/", status_code=status.HTTP_200_OK)
def vote(
    vote: schemas.Vote,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(oauth2.get_current_user)
):
    post = db.query(models.Post).filter(models.Post.id == vote.post_id).first()
    if not post:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail=f"Post with id: {vote.post_id} does not exist")

    vote_query = db.query(models.Vote).filter(
        models.Vote.post_id == vote.post_id,
        models.Vote.user_id == current_user.id
    )
    found_vote = vote_query.first()

    if vote.dir == 1:
        if found_vote:
            # Already voted -> remove vote (unlike)
            vote_query.delete(synchronize_session=False)
            db.commit()
            action = "removed"
            is_voted = False
        else:
            # Add vote (like)
            new_vote = models.Vote(post_id=vote.post_id, user_id=current_user.id)
            db.add(new_vote)
            db.commit()
            action = "added"
            is_voted = True
    else:
        if found_vote:
            vote_query.delete(synchronize_session=False)
            db.commit()
        action = "removed"
        is_voted = False

    # Calculate exact total distinct votes for this post
    total_votes = db.query(func.count(models.Vote.post_id)).filter(models.Vote.post_id == vote.post_id).scalar() or 0

    return {
        "message": f"Vote {action}",
        "voted": is_voted,
        "total_votes": total_votes
    }