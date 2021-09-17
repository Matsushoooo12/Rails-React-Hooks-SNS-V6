class Api::V1::UsersController < ApplicationController
    def show
        render json: Post.where(user_id: params[:id])
    end
end
