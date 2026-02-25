<div align="center">

# 💬 ChatApp

Real‑time group chat built with ASP.NET Core 9, SignalR, and Angular 19.

[![.NET](https://img.shields.io/badge/.NET-9.0-512BD4?logo=.net&logoColor=white)](https://dotnet.microsoft.com/) 
[![Angular](https://img.shields.io/badge/Angular-19-DD0031?logo=angular&logoColor=white)](https://angular.dev/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5-3178C6?logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![SignalR](https://img.shields.io/badge/SignalR-Realtime-2C3E50)](https://learn.microsoft.com/aspnet/core/signalr/introduction)
[![License](https://img.shields.io/badge/License-MIT-green.svg)](LICENSE)

<br/>
</div>

### ✨ Features
- **JWT authentication** with ASP.NET Identity
- **Real‑time messaging** via SignalR hubs
- **Group chat** with message history (MongoDB service) and SQL user/group metadata
- **Image upload** (Cloudinary integration + static serving)
- **Modern UI** with Angular 19 + Material + Tailwind
- **Docker support** for API and client

### 🧱 Tech Stack
- **Backend**: ASP.NET Core 9, EF Core (SQL Server), SignalR, JWT
- **Storage**: SQL Server (EF Core migrations), MongoDB (message archive)
- **Frontend**: Angular 19, RxJS, Tailwind, Angular Material


### 🚀 Quick Start (Local)
Prerequisites: .NET 9 SDK, Node 20+, Angular CLI, SQL Server LocalDB, MongoDB (optional for message archive).

1) Backend API
```bash
cd API
dotnet restore
dotnet ef database update   # optional if you want to apply migrations explicitly
dotnet run --launch-profile http
```
The API runs at `http://localhost:5000` by default.

2) Frontend Client
```bash
cd client
npm ci
npx ng serve --port 4200 --host localhost --configuration development
```
Open `http://localhost:4200`.

### 🔧 Environment setup (examples)
Clone users can create environment files quickly using these examples.

Client (Angular) environment examples:
```ts
// client/src/environments/environment.example.ts
export const environment = {
  production: false,
  baseUrl: 'http://localhost:5000',
  cloudinary: {
    cloudName: 'your_cloud_name',
    uploadPreset: 'your_unsigned_preset'
  }
};

// client/src/environments/environment.development.example.ts
export const environment = {
  production: false,
  baseUrl: 'http://localhost:5000',
  cloudinary: {
    cloudName: 'your_cloud_name',
    uploadPreset: 'your_unsigned_preset'
  }
};

// client/src/environments/environment.production.example.ts
export const environment = {
  production: true,
  baseUrl: 'https://your-api-base-url',
  cloudinary: {
    cloudName: 'your_cloud_name',
    uploadPreset: 'your_unsigned_preset'
  }
};
```

Then copy to actual files (which can be gitignored if desired):
```bash
cp client/src/environments/environment.example.ts client/src/environments/environment.ts
cp client/src/environments/environment.development.example.ts client/src/environments/environment.development.ts
cp client/src/environments/environment.production.example.ts client/src/environments/environment.production.ts
```

Backend example config (development):
```json
// API/appsettings.Development.example.json
{
  "Logging": { "LogLevel": { "Default": "Information", "Microsoft.AspNetCore": "Warning" } },
  "JWTSettings": { "SecretKey": "dev_only_change_me" },
  "MongoDBSettings": { "ConnectionString": "mongodb://localhost:27017", "DatabaseName": "chat_app" },
  "ConnectionStrings": { "DefaultConnection": "Server=(localdb)\\\\MSSQLLocalDB;Database=ChatAppDev;Trusted_Connection=True;MultipleActiveResultSets=true" },
  "Cloudinary": { "CloudName": "your_cloud_name", "ApiKey": "", "ApiSecret": "" }
}
```

Copy to real development file:
```bash
cp API/appsettings.Development.example.json API/appsettings.Development.json
```

### 🔐 Configuration
- API development settings live in `API/appsettings.Development.json`.
- For security, `API/appsettings.json` (prod secrets) is ignored by git.
- Client base API URL is set in:
  - `client/src/environments/environment.development.ts`
  - `client/src/environments/environment.ts`

Ensure both point to the API base URL, e.g. `http://localhost:5000`.

### 🧩 Important Endpoints
- `GET /` → health check
- `POST /account/login` → login
- `POST /account/register` → register
- `GET /hubs/chat` (SignalR) → web socket endpoint

### 🗂️ Project Structure
```
ChatApp-main/
  API/                 # ASP.NET Core backend, SignalR hub, EF Core
  client/              # Angular 19 frontend
```

### 🐳 Docker (optional)
Backend
```bash
cd API
docker build -t chatapp-api .
docker run -p 5000:5000 chatapp-api
```

Frontend
```bash
cd client
docker build -t chatapp-client .
docker run -p 4200:80 chatapp-client
```

### ✅ Status
- Local development tested with API at `http://localhost:5000` and client at `http://localhost:4200`.

### 🤝 Contributing
PRs welcome! Please open an issue for feature requests and bugs.

### 📄 License
MIT

Made with ❤️ by Mohamed Zakaria Cherki
