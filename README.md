# Weekly Task Calendar

A web application for viewing and managing weekly tasks, where helpers can view jobs and mark them as completed.

## Tech Stack

- **Next.js 14** - React framework
- **TypeScript** - Type safety
- **Material UI** - UI component library
- **date-fns** - Date handling

## Features

- 📅 Weekly calendar view
- ✅ Task completion status marking
- ➕ Add new tasks
- 📋 Task list management
- 🎨 Modern Material UI interface

## Getting Started

### Install Dependencies

```bash
npm install
```

### Run Development Server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) to view the application.

### Build for Production

```bash
npm run build
npm start
```

## Project Structure

```
├── app/
│   ├── layout.tsx      # Root layout
│   ├── page.tsx        # Main page
│   └── globals.css     # Global styles
├── components/
│   ├── ThemeProvider.tsx    # Material UI theme provider
│   ├── WeeklyCalendar.tsx   # Weekly calendar component
│   └── TaskManager.tsx      # Task management component
├── types/
│   └── task.ts         # Task type definitions
└── package.json
```

## Usage

1. **View Weekly Tasks**: See the current week's task distribution on the main page
2. **Navigate Weeks**: Use the left/right arrow buttons to switch between weeks
3. **Mark Complete**: Click the checkbox before a task or click the task directly to mark completion status
4. **Add Task**: Click the "Add Task" button, fill in task information and select a date

