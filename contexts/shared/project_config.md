# Project Configuration

## Project Directory Settings
{{include:config/project.json}}

## Usage
All roles should analyze and work on files in the configured project directory, not the PODs framework directory itself.

When PODs is installed in `my-project/pods/`, the project_directory setting of ".." points to `my-project/` as the target project directory.