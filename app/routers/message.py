# app/routers/message.py
from typing import List
from .. import models, schemas, oauth2
from fastapi import Response, status, HTTPException, Depends, APIRouter
from sqlalchemy.orm import Session
from sqlalchemy import or_, and_, desc
from ..database import get_db

router = APIRouter(tags=["Direct Messages"])

@router.post("/messages/", status_code=status.HTTP_201_CREATED, response_model=schemas.DirectMessageOut)
def send_message(
    message: schemas.DirectMessageCreate,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(oauth2.get_current_user)
):
    if message.receiver_id == current_user.id:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Cannot send direct messages to yourself")

    receiver = db.query(models.User).filter(models.User.id == message.receiver_id).first()
    if not receiver:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail=f"User with id {message.receiver_id} not found")

    new_msg = models.DirectMessage(
        sender_id=current_user.id,
        receiver_id=message.receiver_id,
        content=message.content
    )
    db.add(new_msg)
    db.commit()
    db.refresh(new_msg)
    return new_msg

@router.get("/messages/{user_id}", response_model=List[schemas.DirectMessageOut])
def get_chat_history(
    user_id: int,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(oauth2.get_current_user)
):
    # Fetch messages exchanged between current_user and user_id
    messages = db.query(models.DirectMessage).filter(
        or_(
            and_(models.DirectMessage.sender_id == current_user.id, models.DirectMessage.receiver_id == user_id),
            and_(models.DirectMessage.sender_id == user_id, models.DirectMessage.receiver_id == current_user.id)
        )
    ).order_by(models.DirectMessage.timestamp.asc()).all()

    # Mark unread messages sent by user_id as read
    db.query(models.DirectMessage).filter(
        models.DirectMessage.sender_id == user_id,
        models.DirectMessage.receiver_id == current_user.id,
        models.DirectMessage.is_read == False
    ).update({"is_read": True}, synchronize_session=False)
    db.commit()

    return messages

@router.get("/conversations/", response_model=List[schemas.ConversationOut])
def get_conversations(
    db: Session = Depends(get_db),
    current_user: models.User = Depends(oauth2.get_current_user)
):
    # Find all direct messages involving current_user
    msgs = db.query(models.DirectMessage).filter(
        or_(
            models.DirectMessage.sender_id == current_user.id,
            models.DirectMessage.receiver_id == current_user.id
        )
    ).order_by(desc(models.DirectMessage.timestamp)).all()

    conversations_map = {}
    for m in msgs:
        other_user_id = m.receiver_id if m.sender_id == current_user.id else m.sender_id
        if other_user_id not in conversations_map:
            other_user = db.query(models.User).filter(models.User.id == other_user_id).first()
            if other_user:
                conversations_map[other_user_id] = {
                    "user": other_user,
                    "last_message": m.content,
                    "timestamp": m.timestamp
                }

    return list(conversations_map.values())
