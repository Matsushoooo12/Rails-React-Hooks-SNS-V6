class Api::V1::CommentsController < ApplicationController

    def create
        comment = current_api_v1_user.comments.new(post_id: params[:post_id], user_id: current_api_v1_user.id, content: params[:content])
        if comment.save
            render json: comment
        else
            render json: comment.errors, status: 422
        end
    end
end
