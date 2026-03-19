NEORAGE — Cloud Storage Platform
A full-stack cloud storage system built with React (frontend), Java Spring Boot (backend), and Supabase (auth + S3-backed file storage).
---
Tech Stack
Layer	Technology
Frontend	React 19, Vite, Tailwind CSS
Backend	Java Spring Boot
Auth	Supabase Auth
Storage	Supabase Storage (S3)
---
Prerequisites
Make sure you have the following installed:
Node.js v18+
npm v9+
Java 17+ (JDK)
Maven or Gradle (whichever your Spring Boot project uses)
---
Project Structure
```
/
├── frontend/         # React + Vite app (this repo)
└── backend/          # Java Spring Boot API
```
> If your frontend and backend live in the same repo, adjust paths accordingly.
---
Running the Backend (Spring Boot)
Navigate to your backend directory:
```bash
cd backend
```
With Maven
```bash
./mvnw spring-boot:run
```
With Gradle
```bash
./gradlew bootRun
```
The backend starts on http://localhost:8080
Backend API Endpoints
Method	Endpoint	Description
GET	`/files?userId=<email>`	List files for a user
POST	`/upload`	Upload a file (multipart form)
DELETE	`/delete?fileName=<name>\&userId=<email>\&folder=<folder>`	Delete a file
---
Running the Frontend (React + Vite)
Navigate to your frontend directory:
```bash
cd frontend
```
1. Install dependencies
```bash
npm install
```
2. Configure Supabase
Your Supabase URL and anon key are already set in `src/supabase.js`. If you need to change them, update that file:
```js
const supabaseUrl = "your-supabase-url"
const supabaseAnonKey = "your-anon-key"
```
Note : you can find example.application.properties replace the values with your credentials in that file for it to work
3. Start the dev server
```bash
npm run dev
```
The frontend starts on http://localhost:5173
> Make sure the backend is running on port \*\*8080\*\* before using upload/delete features.
---
Building for Production
```bash
npm run build
```
Output is placed in the `dist/` folder. You can preview it with:
```bash
npm run preview
```
---
Features
User authentication (login, signup, forgot password, password reset)
Create folders to organize files
Upload files via drag-and-drop or file browser
Download, delete, and share files
Search files and folders
---
Author
Dhruv Tripathi  
BMS Institute of Technology and Management — ECE  
dhruvtripathi1141@gmail.com
