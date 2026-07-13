# Startup Incubator AI - Use Case Diagram

This document outlines the professional Use Case Diagram and actor interactions for the **Startup Incubator AI** platform.

## Use Case Diagram

```mermaid
flowchart LR
    %% Defining Actors
    User((("👤 Entrepreneur\n(User)")))
    Admin((("🛡️ Administrator\n(Admin)")))
    System((("⚙️ System\n(Cron/Automation)")))

    %% System Boundary
    subgraph SystemBoundary ["Startup Incubator AI Platform"]
        direction TB
        
        %% Authentication & User Management
        subgraph Auth ["Authentication & Profile"]
            UC1(["Register / Login (incl. Guest)"])
            UC2(["Manage Profile (Avatar, Email)"])
        end
        
        %% Core Incubation Features
        subgraph Core ["Idea Incubation Engine"]
            UC3(["Submit Startup Idea"])
            UC4(["View AI Feasibility Scoring"])
            UC5(["Review Market & Financials"])
            UC6(["Download PDF Report"])
        end
        
        %% History & Tracking
        subgraph History ["History & Tracking"]
            UC7(["Manage Idea History (View/Delete)"])
            UC8(["Background Activity Tracking (Time/Visits)"])
        end
        
        %% Administration
        subgraph AdminPanel ["Admin Dashboard"]
            UC9(["View Platform Analytics"])
            UC10(["Monitor User Activity"])
            UC11(["Trigger/Send Weekly Reports (Email)"])
        end
    end

    %% Mapping Actor Interactions
    
    %% User Interactions
    User --> UC1
    User --> UC2
    User --> UC3
    User --> UC4
    User --> UC5
    User --> UC6
    User --> UC7
    User --> UC8

    %% Admin Interactions
    Admin --> UC1
    Admin --> UC9
    Admin --> UC10
    Admin --> UC11
    
    %% System Interactions
    System --> UC8
    System --> UC11

    %% Use Case dependencies/includes (Optional detailing)
    UC3 -. "<<includes>>" .-> UC4
    UC4 -. "<<includes>>" .-> UC5
    UC6 -. "<<extends>>" .-> UC4

    classDef actorStyle fill:#2d3748,stroke:#4fd1c5,stroke-width:2px,color:#fff,font-weight:bold;
    classDef usecaseStyle fill:#4a5568,stroke:#a0aec0,stroke-width:1px,color:#e2e8f0;
    classDef boundaryStyle fill:none,stroke:#4a5568,stroke-width:2px,stroke-dasharray: 5 5;
    
    class User,Admin,System actorStyle;
    class UC1,UC2,UC3,UC4,UC5,UC6,UC7,UC8,UC9,UC10,UC11 usecaseStyle;
    class SystemBoundary boundaryStyle;
```

## Actor Definitions

1. **Entrepreneur (User)**: The primary end-user who utilizes the platform to validate startup ideas, view feasibility scores, and download PDF reports.
2. **Administrator (Admin)**: The platform owner who monitors traffic, user engagement, and platform analytics via a secured dashboard.
3. **System (Cron/Automation)**: The automated background processes responsible for tracking time/visits and dispatching automated weekly email reports.

## Key Subsystems & Use Cases

### 1. Authentication & Profile
- **Register / Login**: Users can create an account, log in, or use a guest account. Admins have a dedicated bypass/login.
- **Manage Profile**: Users can update their username, email, and profile avatar.

### 2. Idea Incubation Engine
- **Submit Startup Idea**: Users submit their concept, required funding, and target platform.
- **View AI Feasibility Scoring**: The core feature that calculates Success Probability, Risk Coefficient, and Innovation Score.
- **Review Market & Financials**: Provides insights on Market Potential (TAM, SAM, SOM) and Capital Budget status.
- **Download PDF Report**: Allows users to export their feasibility model as a professionally formatted native PDF.

### 3. History & Tracking
- **Manage Idea History**: Users can access their previously generated reports and permanently delete them.
- **Background Activity Tracking**: The system tracks user session time and overall page visits.

### 4. Admin Dashboard
- **View Platform Analytics**: Aggregates total visits, time spent, and total logins across all users.
- **Monitor User Activity**: Admins can see a breakdown of individual users and the ideas they've generated.
- **Trigger/Send Weekly Reports**: Generates and emails an automated weekly activity report via Nodemailer (both manually triggered by admin and automatically by the cron job).
