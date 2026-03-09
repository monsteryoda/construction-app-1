# Construction Management System - Database Schema

## Tables

### 1. profiles
- Stores user profile information
- Fields: id, first_name, last_name, avatar_url, updated_at
- RLS: Users can only access their own profile

### 2. projects
- Main projects table
- Fields: id, user_id, project_name, contract_number, client, consultant, contractor, contract_period, date_of_commence, date_of_completion, defect_liability_period, project_image_url, status, created_at
- RLS: Users can only access their own projects

### 3. project_activities
- Project activities/tasks
- Fields: id, user_id, project_id, activity_name, description, activity_date, status, priority, assigned_to, created_at
- RLS: Users can only access their own activities

### 4. project_deliveries
- Material and equipment deliveries
- Fields: id, user_id, project_id, delivery_item, description, delivery_date, expected_date, status, quantity, unit, supplier, created_at
- RLS: Users can only access their own deliveries

### 5. project_schedules
- Project timeline and tasks
- Fields: id, user_id, project_id, task_name, description, start_date, end_date, progress, status, dependencies, created_at
- RLS: Users can only access their own schedules

### 6. project_documents
- Project documentation
- Fields: id, user_id, project_id, document_name, document_type, description, file_url, file_size, version, uploaded_at
- RLS: Users can only access their own documents

### 7. project_issues
- Project issues and problems
- Fields: id, user_id, project_id, issue_title, description, issue_type, severity, status, reported_by, assigned_to, reported_date, resolved_date, resolution_notes, created_at
- RLS: Users can only access their own issues

## Authentication
- Using Supabase Auth
- Email/password authentication
- Automatic profile creation on signup