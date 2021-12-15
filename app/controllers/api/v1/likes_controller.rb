class Api::V1::LikesController < ApplicationController
    before_action :authenticate_api_v1_user!, only: ['create']

    def index
        likes = Like.all.order(created_at: :desc)
        render json: likes
    end

    def create
        like = Like.new(post_id: params[:id], user_id: current_api_v1_user.id)

        if like.save
            render json: like
        else
            render json: like.errors, status: 422
        end
    end

    def destroy
        like = Like.find_by(user_id: current_api_v1_user.id, post_id: params[:id])
        if like.destroy
            render json: like
        else
            render json: like.errors, status: 422
        end
    end
end
