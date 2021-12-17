class Api::V1::UsersController < ApplicationController
    def show
        user = User.find(params[:id])
        posts = Post.where(user_id: user.id)
        user_likes = Like.where(user_id: user.id)
        user_list = {
            id: user.id,
            email: user.email,
            posts: posts.map {|post| {id: post.id, title: post.title, content: post.content, likes: post.likes}},
            like_posts: user_likes.map {|like| {id: like.id, post_id: like.post_id, user_id: like.user_id, post: Post.where(id: like.post_id), post_user: Post.where(id: like.post_id)[0].user, likes_count: Post.where(id: like.post_id)[0].likes}}
        }
        render json: user_list
    end
end
