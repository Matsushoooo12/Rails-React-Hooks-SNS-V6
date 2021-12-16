class Api::V1::UsersController < ApplicationController
    def show
        user = User.find(params[:id])
        posts = Post.where(user_id: user.id)
        user_list = {
            id: user.id,
            email: user.email,
            posts: posts.map {|post| {id: post.id, title: post.title, content: post.content, likes: post.likes}},
        }
        render json: user_list
    end
end
