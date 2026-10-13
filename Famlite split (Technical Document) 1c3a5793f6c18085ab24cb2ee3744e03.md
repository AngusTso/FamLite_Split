# Famlite split  (Technical Document)

# **Split預編碼階段：程序與步驟**

預編碼階段的目的是將Split從概念轉化為具體、可執行的開發計畫，避免後期返工。以下是所有步驟，按順序排列，每步附上說明和你的行動方向：

## **1. 問題定義（Problem Definition）**

**Problem Statement**

Task management tools currently available in the market lack a focus on sharing and ease of use, particularly for small-scale, everyday tasks. Most competitors, such as Trello, Asana, or Microsoft To-Do, are designed with professional work or large-scale project management in mind, leaving a gap for simpler, more casual needs. For smaller tasks—like splitting chores or organizing a group outing—people are forced to rely on inefficient alternatives, such as personal to-do lists or messaging apps like WhatsApp and WeChat. These makeshift solutions fail to provide a seamless, shared experience, resulting in confusion, inefficiency, and frustration

**Pain Points**

- Lack of Centralized Tracking: Once tasks are split, individuals must track their responsibilities independently, often leading to oversight or miscommunication.
- Inefficient Task Assignment: When new tasks arise, group leaders typically resort to lengthy discussions via group chats or video calls, wasting time and effort.
- No Simple Shared Task Tool: There’s no intuitive, user-friendly solution dedicated to splitting and managing tasks collaboratively among small groups.
- Tasks Get Buried in Chats: Important tasks are easily forgotten or overlooked because they’re buried in a flood of chat messages, making it hard to locate and prioritize them.
- Manual Reminders Required: Users must manually set calendar alerts or reminders for deadlines, adding an extra layer of effort to an already cumbersome process.

**Target Audience**

- Students (Secondary and College): Groups working on school projects, organizing study sessions, or planning casual gatherings like movie nights or picnics.
- Families: Households managing daily chores (e.g., washing dishes, grocery shopping) or coordinating family events like reunions or outings.
- Small to Medium Hobby Groups: Communities such as running clubs, book circles, or crafting enthusiasts arranging meetups, shared responsibilities, or small-scale activities

**Solution Overview**

FamLite Split is a minimalist, easy-to-use mobile application designed to simplify task splitting and management for small groups. Unlike professional task management tools with steep learning curves, Split offers a streamlined interface that allows a group leader to quickly create tasks and assign them to members—either manually or automatically—without unnecessary complexity. Key features include real-time task synchronization, ensuring all members instantly see updates (e.g., when a task is completed), and multilingual support (English, Traditional Chinese, Simplified Chinese) to cater to diverse users. Additionally, Split provides notifications and widgets for effortless task tracking and deadline reminders, eliminating the need for external tools or endless chat scrolling. With a built-in referral mechanism (e.g., invite three friends to unlock premium features), it encourages organic growth, making it the ideal solution for small to medium activities where simplicity and collaboration are paramount.

---

## **2. 用戶需求分析（User Requirements Analysis）**

| Requirements | Priority | Description |
| --- | --- | --- |
| create tasks | High | a simple form for leader or sub leader to enter task fast |
| Split task | High | provide easy way to split task automatically or manually, make splitting work seamlessly |
| Real time shared task board | High | Provide a real time shared board for tracking |
| Group management and invite link system | High | A simple group management system like leader adding or removing people and a invite link system to enable people to join via link |
| Multiple language support | High | 3 language support like english , mandarin or cantonese can use translate app to add other language |
| Copy and paste the same task (could be like template) | High | A way for people to duplicate task or even create template for populate task |
| Task redistribution | High | a easy redistribute system with a button or a drag and drop interface |
| Color priority indicator | Medium | A colored priority  light for listing priority (red , yellow, green) |
| Notification system | Medium | A notification system for notifying work done and message |
| Overview of each member task | Medium | A drawer nav that can open to see which member handle which task |
| Progress bar | Medium | A progress bar to track the percentage of work done |
| Game elements like task points , leaderboard | Medium | Task point to track how people do in the group and a leaderboard. |
| Task history | Medium | A History tab for each room for the task completed (not thinking about personal history just yet) |
| Deadline tracker | Medium | A time tracker for task and send notification when deadline approach |
| Leader universal message | Medium | could be a info board that leader can edit or a universal pushing message system |
| Invite for unlock higher functionality probably like a leader role had to invite 3 people | Medium | a invite system for unlocking bigger role function and no ads |
| Offline mode | Low | A offline mode that for only watching task and only sync when connected to the internet |
| Voice input | Low | Voice input for task detail |
| Task comments system | Low | A simple task comments system for leaving additional comment to task |
| Ordering and filtering system | Low | A ordering and filtering system for task board |
| Widget for closest to deadline task | Low | widget displaying the task due |
| Roles | Low | Different role in groups more than just leader and vice-leader |
| Animation | Low | Different Animation for like competing task and the whole project |
| Personal task board | Low | A personal task board for easy access to their task |

**Create Task**

**Description**: User can enter a task name (Mandatory *50 word for english, 20 word for chinese) for the task in the input field that alway below the screen like an whatsapp chat box

There will be an arrow to open the whole panel for more detail input like description and date (Optional)

User hit a + button then it will push to the taskboard

**Priority**: high

**Tech implementation:**

FrontEnd:

Use React Native to provide a Text input and a + button , an arrow button to open a modal for detailed input like a text area input for description and a Date picker for date

Backend:

A post /tasks route to receive data and store to Database

Instant update:

Socket.io to push new mission to the Shared Task Board

**Split Task**

**Description**:

A hovering button that is have a random icon to shuffle the task

The shuffle button will act a redistribute button and a auto split button

User can also open the detail of task by clicking a + behind the task block to open a more detail of the task and manually select the member that will take care of task

**Priority**: high

**Tech implementation:**

FrontEnd:

a shuffle button with a random icon and click it will auto shuffle task

Backend:

A put request to route /task to update every time user shuffled and  save the detail of task (not sure yet)

Instant update:

use Socket.io instantly update task detail

**Real time shared task board**

**Description**:

This will be the default screen when user clicked into a group like whatsapp

It just a empty space for storing Task block (pressable)

On the top of the board , it will be a switch for switching to overview or member view

Overview will just be the normal view that full of task

Member view will just be the same but it will be separate task according to the member

Extended after mvp:

a filter and order button next to the the switch

Order will be able to sort according to Task Name or Deadline

Filter will able to filter for different function (not decided yet)

**Priority**: High

**Tech implementation:**

FrontEnd:

A blank white / dark screen that able to fit task block

The task block will be retrieved from the Database and populate to the screen

Build the task block and make it pressable for pop up menu

Task block have a + button to open the detail about task

A checkbox in front of task name to check off the task

Extended after mvp

Support for dark mode as well / white mode depend on which i implemented first

Backend:

Get /task route to get all task

Get /task/:id to get a single task detail

Instant update:

use Socket.io to update any change to the task list

**Group management and invite link system**

**Description**:

a drawer navigation like discord to see what member is here

The leader or the group opener can kick people out or invite people via link to enter the group

I can probably generate a code for each group as well to get in quick by the code

**Priority**: High

**Tech implementation:**

FrontEnd:

A drawer navigation that display the group member , the one will more right will have a kick option next to each member

Backend:

When user created a group, issue a post request to /group to generate a code and link for user and save the username of the opener as the leader

when another user clicked the link or enter the code, we can issue a get request to /group to able to let the people in to the group and a put request to same route to add the user into group

Instant update:

N/A

**Multiple language support**

**Description**:

User can change the Language By switching by choosing the language in a menu Support for Chinese(Simplified and Traditional) and English at MVP

Won’t change anything user input

**Priority**: High

**Tech implementation:**

FrontEnd:

Use i18n library for the multi-language support

A Setting menu with a dropdown select field and select the language Chinese or English

Backend: N/A

**Copy and paste the same task (could be like template)**

**Description**:

User can long press of existing task (Crossed or existing one) and user able to select a duplicate from a menu

**Priority**: High

**Tech implementation:**

FrontEnd:

React native to provide a pressable task block in the shared taskboard

After user long press on user can select duplicate in a small pop up menu like how whatsapp select a emoji reponse

Extended after mvp:

a system for user to long press open the pop up menu and clicked save next to the already exist duplicate button and save as template

Backend:

When the user duplicate , make another post request to /task with the content of the task and save to database with a different ID

Extended after mvp:

Create a new routes /taskTemplate to support the system

every time user save the task as template make a post request to the /task template and save to db

Instant update:

use Socket.io to push the task again to the task board again

## 4 . Non-functional requirement

| **Performance** | **Description** | **Priority** |
| --- | --- | --- |
|  | Able to handle concurrent 100 users with response time < 1 sec | High |
|  | Support 4-12 people groups with no lag | High |
|  | Task notifications via socket.io in < 0.5 sec | High |
| **Security & Compliance** |  |  |
|  | JWT for user authentication | High |
|  | AES encryption for personal data with HTTPS | High |
|  | Compliance with app store guidelines | Medium |
| **Usability & Reliability** |  |  |
|  | Create tasks in 3 clicks or less | High |
|  | One-click auto split, two-click manual split | High |
|  | Login/register under 1 minute | High |
|  | Two-click task duplication | High |
|  | 99% uptime with no crashes | Medium |
|  | Zero-downtime updates via Expo OTA | Medium |
| **Scalability** |  |  |
|  | Able to handle 10K at first and able to expand to 200K user without significant architecture changes | HIgh |
|  | Support more language like korean and japanese without any change on the ui  | Low |
|  | Support google, facebook and apple login | Low |

## **5. Wireframes**

![1000072246.jpg](1000072246.jpg)

## **6. 技術架構設計（Technical Architecture Design）**

- **目標**：定義前端、後端、資料庫結構。
- **說明**：規劃Split的技術實現，確保可擴展。
- **你的行動**：
    - 寫下架構：
        - **前端**：React Native（iOS/Android），多語言支援（i18n）。
        - **後端**：Node.js+Express，REST API（/tasks、/groups）。
        - **資料庫**：MongoDB，集合（users、tasks、groups）。
        - **實時**：[Socket.IO](http://socket.io/)（任務同步）。
        - **部署**：AWS EC2 t3.micro（HKD 100/月）。
    - 畫簡單架構圖：客戶端 → API → 資料庫。

## 7.Data Model

User

- Id: unique identifier (user id)
- Username: string (50 for English word only) index
- Password: string(30 english word)
- Name: string (30 for English, 10 for Chinese word)
- Email: string (with email validation) index
- Groupid: [objecId] (ref: group) index
- CreatedAt: Date index
- UpdatedAt: Date
- PhoneNumbers : string

```jsx
const UserSchema = new mongoose.Schema({
  username: { type: String, required: true, maxlength: 50, unique: true, index: true },
  name: { type: String, required: true, maxlength: 30 },
  email: { type: String, required: true, unique: true, index: true },
  password: { type: String, required: true },
  phone: { type: String },
  groups: [{ type: mongoose.Schema.Types.ObjectId, ref: "Group", index: true }],
  createdAt: { type: Date, default: Date.now, index: true },
  updatedAt: { type: Date, default: Date.now }
});
```

Task

- Id : unique identifier (task id)
- Task name: String (50 for English, 20 for Chinese)
- CreatedAt: Date index
- UpdatedAt: Date
- Isdone: Boolean (default false) index
- Duedate : _date (optional) index
- AssignedTo: [objectid](userid)
- GroupID: objectId(groupId) index
- Description: String (50 English word) optional

```jsx
const TaskSchema = new mongoose.Schema({
  name: { type: String, required: true, maxlength: 50 },
  description: { type: String },
  groupId: { type: mongoose.Schema.Types.ObjectId, ref: "Group", required: true, index: true },
  assignedTo: [{ type: mongoose.Schema.Types.ObjectId, ref: "User", index: true }],
  dueDate: { type: Date, index: true },
  isCompleted: { type: Boolean, default: false, index: true },
  createdBy: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  createdAt: { type: Date, default: Date.now, index: true },
  updatedAt: { type: Date, default: Date.now }
});
```

Group 

- Id: unique identifier (group id)
- Member : [Objectid] index
- InviteCode: String ( a week expiring) index
- InviteLink: String ( a week expiring)
- GroupName: String
- LeaderID: objectid (userid) index
- InviteExpired: Date( 7 day) index
- CreatedAt: Date index

```jsx
const GroupSchema = new mongoose.Schema({
  name: { type: String, required: true, maxlength: 30 },
  leaderId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true, index: true },
  members: [{ type: mongoose.Schema.Types.ObjectId, ref: "User", index: true }],
  inviteCode: { type: String, required: true, unique: true, index: true },
  inviteLink: { type: String, required: true },
  inviteExpiresAt: { type: Date },
  createdAt: { type: Date, default: Date.now, index: true },
  updatedAt: { type: Date, default: Date.now }
});
```

**8. API設計（API Design）**

**Task API**

Get:

- Get /tasks: Get all Task
- Get /task/:assignedTo: get task of a user that assigned to it
- Get /task/:groupid: get task of a group

post:

- POST /tasks：輸入 {title: "洗碗", assignedTo: "user123"}，輸出 {id: "task456"}。

put:

- Put /task/:taskid : input {title: "洗碗", assignedTo: "user123"}，輸出 {id: "task456"}。

delete:

- delete /task/:taskid : delete a specific task
- delete /task/:groupid : delete the whole group tasks

**Group**

Get:

- Get /groups/:leaderID: Get leader
- Get /groups/Member : Get All member
- Get /groups/invitecode: Get invitecode
- Get /groups/InviteLink: Get InviteLink
- Get /groups : get all detail about a group

Post 

- post /groups/create : create a new group  input{groupname:”Happy” , leader: userid}

Put

- put /groups/addMember: add new member to the group

delete:

- delete /groups/:groupid : delete the whole group tasks

User

Get:

- Get /users/:userID: Get user detail
- Get /users/groups: Get All group user belong too

Post 

- post /users/create : create a new user {username: “angus”, password:”123” ,email: “angusking47@gmail.com”}

Put

- put /users/changeDetail: change user detail

Delete:

- Delete /users/user:id: Get All group user belong too

## 9.Split Timeline and achievements

總時間：3月27日-4月30日（34天，200-270小時）。

階段：

預編碼（3月27-3月29，3天，18-24小時）：

3月27日：非功能需求、流程圖、使用者故事。

3月28日：線框圖、技術架構。

3月29日：資料模型、API設計。

里程碑：預編碼完成。

後端開發（3月30-4月11，13天，80-100小時）：

API（6項功能）、MongoDB、Socket.IO、JWT。

4月11日Render初部署。

里程碑：後端可運行。

前端開發（4月12-4月21，10天，60-80小時）：

React Native UI。

里程碑：前端完成。

整合+上線（4月22-4月30，9天，50-70小時）：

聯調、測試、上線。

里程碑：4月30日上線。

[Split dev Timeline ](Split%20dev%20Timeline%201c3a5793f6c18082885dd0162eabae1c.csv)

Problem right now