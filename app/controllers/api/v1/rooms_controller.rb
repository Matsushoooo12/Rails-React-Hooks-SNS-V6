class Api::V1::RoomsController < ApplicationController
    before_action :authenticate_api_v1_user!, only: [:create, :show, :index]
    def create
        if Entry.where(user_id: params[:id]).present?
            return
        else
            room = Room.create
            Entry.create(room_id: room.id, user_id: current_api_v1_user.id)
            Entry.create(room_id: room.id, user_id: params[:id])
            room = Room.find_by(id: room.id)
            render json: room
        end
    end

    def show
        room = Room.find(params[:id])
        messages = room.messages
        if Entry.where(user_id: current_api_v1_user.id, room_id: room.id).present?
            render json: messages
        else
            render json: messages.errors, status: 422
        end
    end

    def index
        rooms = current_api_v1_user.rooms.to_json(include: %i[messages entries users])
        render json: rooms
    end
end
