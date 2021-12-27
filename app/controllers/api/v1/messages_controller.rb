class Api::V1::MessagesController < ApplicationController
    def create
        message = Message.create(user_id: current_api_v1_user.id, room_id: params[:id], content: params[:content])
        render json: message
    end
end
