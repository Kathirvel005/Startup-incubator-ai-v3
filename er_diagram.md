# Startup Incubator AI - Entity Relationship (ER) Diagram

This document outlines the data model and entity relationships for the **Startup Incubator AI** platform. Since the application utilizes a document-based JSON store (`db.json`), the schema maps out the structured JSON objects and their referential links.

## ER Diagram

```mermaid
erDiagram
    %% Relationships
    USER ||--o{ IDEA : "generates & owns"
    
    %% Entities
    USER {
        string id PK "Unique User Identifier"
        string username "Display Name"
        string gmail "Email Address"
        string password "SHA-256 Hashed Password"
        string profileIcon "Base64 Image Data / Initials"
        int loginCount "Total number of logins"
        datetime lastLogin "Timestamp of last session"
        int totalTimeSeconds "Total time spent on platform"
    }
    
    IDEA {
        string id PK "Unique Idea Identifier"
        string userId FK "Reference to USER.id"
        string title "Name of the startup idea"
        text explanation "Detailed concept description"
        float amount "User's available budget"
        string platform "Target platform/industry"
        int successRate "AI Generated: 50-90"
        int riskRate "AI Generated: 10-50"
        int innovationScore "AI Generated: 70-100"
        float requiredAmount "Calculated: amount * 1.5"
        float remainingAmount "Calculated deficit"
        boolean isBudgetSufficient "True if amount >= requiredAmount"
        string[] recommendations "Array of AI strategic advice"
        int projectedSuccessRate "Post-optimization success metric"
        json steps "Array of {phase, duration, tasks}"
        json similarStartup "Object {name, successRate, industry}"
        datetime timestamp "Creation timestamp"
    }

    STATS {
        int totalVisits "Global site visits tracker"
        int totalTimeSeconds "Global time spent across all users"
    }
```

## Data Dictionary

### 1. `USER`
Represents the registered entrepreneurs on the platform (including guest accounts). 
- **Relationships:** A single `USER` can have zero-to-many (`0..N`) `IDEA`s stored in their history.
- **Notes:** Admin functionality is currently handled via a hardcoded bypass (`kathirvel_admin`), but their time and analytics are aggregated alongside regular users.

### 2. `IDEA`
Represents a generated AI Feasibility Assessment. 
- **Relationships:** Each `IDEA` must belong to exactly one (`1..1`) `USER`. 
- **Notes:** Contains all the financial metrics, generated AI scorings (success, risk, innovation), and nested JSON arrays for the implementation roadmap (`steps`) and competitor analysis (`similarStartup`).

### 3. `STATS`
A singleton system configuration object used for the Admin Dashboard.
- **Relationships:** None. It acts as a global accumulator.
- **Notes:** Tracks raw global metrics like `totalVisits` and `totalTimeSeconds` for high-level administrative reporting.
