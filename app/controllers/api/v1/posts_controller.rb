class Api::V1::PostsController < ApplicationController
    before_action :authenticate_api_v1_user!, only: [:create, :update, :destroy]
    def index
        posts = Post.all.order(created_at: :desc)
        posts_array = posts.map do |post|
            {
                id: post.id,
                user_id: post.user_id,
                title: post.title,
                content: post.content,
                email: post.user.email,
                created_at: post.created_at,
                likes: post.likes.map {|like| {id: like.id, user_id: like.user_id, post_id: like.post_id}}
            }
        end
        render json: posts_array
    end

    def show
        post = Post.find(params[:id])
        post_list = {
            id: post.id,
            user_id: post.user_id,
            title: post.title,
            content: post.content,
            created_at: post.created_at,
            user: post.user,
            likes: post.likes,
            comments: post.comments.map {|comment| {id: comment.id, content: comment.content, user: User.where(id: comment.user_id), user_id: comment.user_id, post_id: comment.post_id}}
        }
        render json: post_list
    end

    def create
        post = Post.new(post_params)
        if post.save
            render json: post
        else
            render json: post.errors, status: 422
        end
    end

    def update
        post = Post.find(params[:id])
        if current_api_v1_user.id === post.user_id
            ActiveRecord::Base.transaction do
                if post.update(post_params)
                    render json: post
                else
                    render json: post.errors, status: 422
                end
            end
        else
            render json: {message: 'can not update data'}, status: 422
        end
    end

    def destroy
        post = Post.find(params[:id])
        if current_api_v1_user.id == post.user_id
            post.destroy
            render json: post
        else
            render json: {message: 'can not delete data'}, status: 422
        end
    end

    private
    def post_params
        params.require(:post).permit(:title, :content).merge(user_id: current_api_v1_user.id)
    end
end
