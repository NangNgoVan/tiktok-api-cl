### `Deprecated` this documentation permanent move to: [here](https://dbdocs.io/anhdiepmmk/pav?view=relationships)
### In this issue we a going to define our data types which will follow some conditions.
- Data type should be flattened (avoid create a data types which allow to create a nested data)
- Easy to scale (it's allow 10, 100, 1000, 10 000, even 1000 000 end user interact with data without performance issue)

### Definition
#### Feed
*One user have many feed*

- id (string)
- created_at (string)
- updated_at (string)
- deleted_at (string)
- type (must be one of `image`, `video`) (string)
- number_of_view (number, default: 0)
- number_of_reaction (number, default: 0)
- number_of_bookmark (number, default: 0)
- created_by (string)
- content (string, `max 255`)
- ~~url (string[])~~ // deprecated using resource_ids instead
- resource_ids (string[])
- song_id (string, optional) // we are not going to implement this for 1st sprint
- hashtags (string[], example: ['blacklivematter', 'raiseforuk', 'worldhello', 'helloworld']

### Feed resource
_the reason why we should split url  property from feed collection into this collection is: feed collection is a thing it's using quite often, so in the feature we have a jobs that maniplulate with feed resouce (optimize video, optimize image) and we don't want these job affect to feed collection_
- id (string)
- path (string)
- feed_id (string)
- type (string, must be one of `image`, `video`)
- created_at (string)
- updated_at (string)

### Feed hash tag
*Actually `hashtags` property in `feed` collection is enough but we are going to duplicate hashtag data to this collection for multi reason*
- id (string)
- feed_id (string)
- hashtag (string, example: 'blacklivematter')
- created_by (string)
- created_at (string)

### Hashtag
*After end user create a feed if there is a tag we create or update tag to this collection, also increment `number_of_use`*
- id (string)
- number_of_use (number, default: 0)
- tag (string, unique)
- created_at (string)
- updated_at (string)

### Song
- id (string)
- display_order (number, default: 999) //sort by display order, desc
- number_of_use (number, default: 0)
- name (string, max 255)
- path (string) //path to mp3 that store in s3
- created_at (string)
- deleted_at (string)
- created_by (string) // only admin can create song in cms

### Song bookmark
- id (string)
- song_id (string)
- created_by (string)
- created_at (string)

#### Feed Comment (user comment to a feed)
*One user have many comment on a feed*

- id (string)
- feed_id (string)
- created_by (string)
- created_at (string)
- level (must be one of `1`, `2`) (number)
- reply_to (string, `optional`)
  *required when level is 2*
- content (string, `max 255`)
- number_of_reaction (number)
- number_of_reply (number)

### Feed reaction (user reaction to a feed)
*One user have one reaction on a feed*
- id (string)
- feed id (string)
- created_by (string)
- type (must be one of `heart`, `like`, `laugh`)
- created_at (string)

### Feed comment reaction (user reaction to a feed's comment)
*One user have one reaction on a feed's comment*
- id (string)
- feed_id (string)
- comment_id (string)
- created_by (string)
- type (must be one of `heart`, `like`, `laugh`)
- created_at (string)

### Feed bookmark
*One user have one bookmark on a feed*
- id (string)
- feed_id (string)
- created_by (string)
- created_at (string)

### User
- id (string)
- gender (must be one of `male`, `female`)
- number_of_followers (number, `default to: 0`)
- birth_day (string)
- full_name (string, `max 50`)
- nick_name (string, `max 50`)
- email (string, `max 50`)
- address (string, `max 50`)
- avatar_url (string)
- should_show_tour_guild (boolean)
- should_show_account_setup_flow (boolean)
- roles (string[]) // this only for cms
- interests (string[])
- blocked_at (string, default: null, optional)
- deleted_at (string, default: null, optional)
- created_at (string)
- updated_at (string)

### User authentication method
*One user have many `authentication method`*
- id (string)
- user_id (string)
- authentication_method (string)
- data (object)
- created_at (string)

  Example:
  ```
  // user a have authentication method credential (they will login via username, password - actually it's just for cms)
  {
    "id": "a id",
    "user_id": "user a",
    "authentication_method": "credential",
    "data": {
      "user_name": "abc"
      "passworld": bcrypt("123456"),
    },
  }

  {
    "id": "b id",
    "user_id": "user b",
    "authentication_method": "metamask",
    "data": {
      ...... // please define the data that using for metamask
    },
  }
  ```

### Authentication method
- name (string, unique)
- created_at (string)

  Example:
  ```
   // metamask (user will login via their wallet)
   {
     "name": "metamask"
     ...
   }

  // credential (user will login with their own user name and passworld)
  {
     "name": "credential"
     ...
   }
  ```

### Role
(this only for cms api)
- name (string, unique)
- permissions (string[])
- created_at (string)

example:
 ```
 // admin
 {
   "name": "admin",
   "permissions": ["feeds:*", "comments:*", "users:*"]
 }
 // modiator
 {
   "name": "modiator",
   "permissions": ["feeds:read", "feeds:update", "comments:update", "comments:read", "users:read"]
 }
 // read only
 {
   "id": "c id",
   "name": "read-only",
   "permissions": ["*:read"]
 }
```

Note: structure of the permission is `subject:action`
- `subject` which is an objective that we are going to to some `action`
- `action` is what we do on `subject`
- `*` mean all
  1. `*:read` mean this role can read all subject
  2. `feeds:*` mean this role can do every thing on subject `feeds`
  3. `comments:read` mean this role can only do action `read` on subject `comment`

Reference (we will using node acl to implement this):
https://github.com/OptimalBits/node_acl

### Action
- name (string)
- created_at (string)

### Subject
- name (string)
- created_at (string)

### User follow
- id (string)
- user_id (string)
- created_by (string)
- created_at (string)

### Interest
- id (string)
- name (string)
- dispaly_order (number)
- created_at (string)
- updated_at (string)