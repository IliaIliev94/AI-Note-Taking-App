# GitHub Issues Import Guide

This file contains instructions for importing the project timeline into GitHub Issues/Projects.

## Method 1: Manual Import via GitHub Projects (Recommended)

1. Go to your GitHub repository
2. Click on "Projects" tab
3. Create a new Project (Board view recommended)
4. Import the `project-timeline.csv` file:
   - Click "..." menu in project
   - Select "Import"
   - Upload the CSV file
   - Map columns: Title, Description, Milestone, Labels

## Method 2: GitHub CLI (Faster for bulk import)

If you have GitHub CLI installed, you can use this script:

```bash
# Install GitHub CLI if needed
# macOS: brew install gh
# Windows: winget install GitHub.cli

# Authenticate
gh auth login

# Navigate to your repo directory
cd your-repo-name

# Create milestones first
gh api repos/:owner/:repo/milestones -f title="Week 1-2: Foundation" -f description="Set up development environment and project structure"
gh api repos/:owner/:repo/milestones -f title="Week 3-4: Authentication" -f description="Build JWT-based authentication system"
gh api repos/:owner/:repo/milestones -f title="Week 5-6: Core CRUD" -f description="Implement notes CRUD and rich text editor"
gh api repos/:owner/:repo/milestones -f title="Week 7-8: First AI Feature" -f description="Add AI summarization and auto-tagging"
gh api repos/:owner/:repo/milestones -f title="Week 9-10: RAG" -f description="Implement semantic search and chat with notes"
gh api repos/:owner/:repo/milestones -f title="Week 11-12: Production" -f description="Deploy and polish the application"
gh api repos/:owner/:repo/milestones -f title="Optional Extensions" -f description="Additional features beyond core timeline"

# Then import issues from CSV using the GitHub web interface
# (GitHub CLI doesn't support CSV import directly)
```

## Method 3: Use the Markdown File

Alternatively, you can copy sections from `project-timeline.md` and create issues manually. Each checkbox item can become a separate issue.

---

## Suggested GitHub Labels to Create

Before importing, create these labels in your repository:

- `setup` - Initial project setup tasks
- `auth` - Authentication related
- `backend` - Backend/API work
- `frontend` - Frontend/UI work
- `database` - Database schema and queries
- `docker` - Docker and containerization
- `ai` - AI features and integration
- `notes` - Core notes functionality
- `deployment` - Deployment and infrastructure
- `ci-cd` - CI/CD pipeline
- `documentation` - Documentation tasks
- `testing` - Testing tasks
- `polish` - UX polish and refinements
- `security` - Security-related tasks
- `monitoring` - Logging and monitoring
- `optional` - Optional/nice-to-have features

---

## Suggested Workflow

1. Create GitHub Project board with columns:
   - 📋 Backlog
   - 🚀 Ready to Start
   - 🏗️ In Progress
   - 👀 In Review
   - ✅ Done

2. Add all imported issues to the Backlog column

3. As you start each week, move relevant issues to "Ready to Start"

4. Track your progress by moving cards across the board

5. Use GitHub's milestone view to see progress by week

---

## Converting to Other Project Management Tools

### Trello
- Use Trello's CSV import feature
- Map: Title → Card Name, Description → Card Description, Milestone → List Name

### Notion
- Import the CSV into a Notion database
- Set up different views for each milestone

### Linear
- Use Linear's CSV import
- Map columns to Linear's fields (Title, Description, Project, Labels)

### Jira
- Use Jira's CSV import tool
- Map: Title → Summary, Description → Description, Milestone → Epic, Labels → Labels

---

## Notes

- The CSV file contains 100+ tasks broken down from the main timeline
- You don't need to create ALL tasks upfront - start with Week 1-2, then add more as you progress
- Adjust the timeline based on your actual pace
- Some tasks can be done in parallel (frontend + backend)
- Feel free to add/modify tasks based on what you learn along the way
