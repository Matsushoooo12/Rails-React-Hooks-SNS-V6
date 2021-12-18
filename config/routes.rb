Rails.application.routes.draw do
  namespace :api do
    namespace :v1 do
      resources :posts do
        member do
          resources :likes, only: [:create]
        end
      end
      resources :relationships, only: [:index, :destroy]
      resources :likes, only: [:index, :destroy]
      resources :users do
        member do
          resources :relationships, only: [:create]
        end
      end
      mount_devise_token_auth_for 'User', at: 'auth', controllers: {
        registrations: 'api/v1/auth/registrations'
      }

      namespace :auth do
        resources :sessions, only: %i[index]
      end
    end
  end
end
