User.create!(email: "test1@test.com", password: "password", password_confirmation: "password")
User.create!(email: "test2@test.com", password: "password", password_confirmation: "password")

user1 = User.find(1)
Post.create!(title: "test1", content: "testtesttest", user: user1)
Post.create!(title: "test2", content: "testtesttest", user: user1)

user2 = User.find(2)
Post.create!(title: "test3", content: "testtesttest", user: user2)
Post.create!(title: "test4", content: "testtesttest", user: user2)