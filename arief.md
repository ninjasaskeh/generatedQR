```bash
 pnpm create next-app@latest ./  
```
```bash
 pnpm add better-auth
```
```bash
 pnpm add better-auth
```
```bash
 pnpm add drizzle-orm
pnpm add -D drizzle-kit
pnpm approve-builds
pnpm add @neondatabase/serverless

pnpm add dotenv


```


Installation

Add the plugin to your auth config
To use the Admin plugin, add it to your auth config.

import { betterAuth } from "better-auth"
import { admin } from "better-auth/plugins"

export const auth = betterAuth({
// ... other config options
plugins: [
admin()
]
})

Migrate the database
Run the migration or generate the schema to add the necessary fields and tables to the database.

npx @better-auth/cli migrate

Add the client plugin
Next, include the admin client plugin in your authentication client instance.

import { createAuthClient } from "better-auth/client"
import { adminClient } from "better-auth/client/plugins"

export const authClient = createAuthClient({
plugins: [
adminClient()
]
})

Usage
Before performing any admin operations, the user must be authenticated with an admin account. An admin is any user assigned the admin role or any user whose ID is included in the adminUserIds option.

Create User
Allows an admin to create a new user.

Client:

const { data: newUser, error } = await authClient.admin.createUser({
email: "user@example.com", // required
password: "some-secure-password", // required
name: "James Smith", // required
role: "user",
data: { customField: "customValue" },
});

server:
const newUser = await auth.api.signUpEmail({
body: {
email: "user@example.com", // required
password: "some-secure-password", // required
name: "James Smith", // required
role: "user",
data: { customField: "customValue" },
},
});

List Users
Allows an admin to list all users in the database.

client:

const { data: users, error } = await authClient.admin.listUsers({
query: {
searchValue: "some name",
searchField: "name",
searchOperator: "contains",
limit: 100,
offset: 100,
sortBy: "name",
sortDirection: "desc",
filterField: "email",
filterValue: "hello@example.com",
filterOperator: "eq",
},
});

server:

const users = await auth.api.listUsers({
query: {
searchValue: "some name",
searchField: "name",
searchOperator: "contains",
limit: 100,
offset: 100,
sortBy: "name",
sortDirection: "desc",
filterField: "email",
filterValue: "hello@example.com",
filterOperator: "eq",
},
// This endpoint requires session cookies.
headers: await headers(),
});


Schema (Admin Plugin additions)
- user table adds: role (text, default "user"), banned (boolean, default false), ban_reason (text), ban_expires (timestamp)
- session table adds: impersonated_by (text)

Migration
- Added migrations/0003_admin_fields.sql to ALTER existing tables accordingly.
- Run your usual migration workflow to apply it.
