# frozen_string_literal: true

class User < ActiveRecord::Base
  # Include default devise modules. Others available are:
  # :confirmable, :lockable, :timeoutable, :trackable and :omniauthable
  devise :database_authenticatable, :registerable,
         :recoverable, :rememberable, :validatable
  include DeviseTokenAuth::Concerns::User

  has_many :posts, dependent: :destroy
  has_many :likes, dependent: :destroy
  has_many :comments, dependent: :destroy

  # has_many :relationships, class_name: "Relationship", foreign_key: "user_id"の意味
  has_many :relationships
  # user.followingsで「自分がフォローしているユーザー達」になる
  has_many :followings, through: :relationships, source: :follow
  # relationshipモデルの逆向きの架空モデルを作る
  has_many :reverse_of_relationships, class_name: 'Relationship', foreign_key: 'follow_id'
  # user.followersで「自分をフォローしているユーザー達」になる
  has_many :followers, through: :reverse_of_relationships, source: :user

  def follow(other_user)
    unless self == other_user
      self.relationships.find_or_create_by(follow_id: other_user.id)
    end
  end

  def unfollow(other_user)
    relationship = self.relationships.find_by(follow_id: other_user.id)
    relationship.destroy if relationship
  end
end
