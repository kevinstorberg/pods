# PODs - AI-Powered Development Framework

A comprehensive AI development framework that functions like a complete Agile Software Engineering Team, with specialized AI agents embodying different professional roles working together to deliver projects from concept to completion.

## 🎯 Purpose

PODs transforms how software is built by providing a structured framework where AI agents collaborate across the entire development lifecycle. Each agent embodies the expertise and responsibilities of key software development roles, enabling teams to:

- **Scale development capacity** with AI-powered professional roles
- **Maintain consistent quality** through structured workflows and handoffs
- **Reduce project complexity** with clear role separation and documentation
- **Accelerate delivery** through parallel workstreams and automated planning

## 🏗️ How It Works

### The Role-Based Workflow

PODs uses a sequential workflow where each role builds upon the previous role's output:

```
Product Manager → Architect → Engineering Manager → Fullstack Engineer → QA Engineer
```

#### 1. **Product Manager**
- Analyzes requirements and defines product specifications
- Creates comprehensive business requirements and user stories
- **Output**: `/branch/{feature}_product_spec.md`

#### 2. **Architect**
- Reviews product specifications and designs technical architecture
- Defines system design, technology choices, and implementation approach
- **Input**: Product specifications from PM
- **Output**: `/branch/{feature}_architecture_spec.md`

#### 3. **Engineering Manager**
- Breaks down architecture into actionable development tickets
- Plans implementation phases and coordinates development work
- **Input**: Architecture specifications from Architect
- **Output**: `/branch/{feature}_tickets.md`

#### 4. **Fullstack Engineer**
- Implements features based on detailed tickets and specifications
- Writes code following architectural guidelines and quality standards
- **Input**: Implementation tickets from Engineering Manager
- **Output**: Working code implementation

#### 5. **QA Engineer**
- Reviews implementation against all specifications and requirements
- Validates quality, tests functionality, and provides final approval
- **Input**: Code implementation + all previous specifications
- **Output**: `/branch/{feature}_qa_report.md`

### Supporting Roles

- **Designer**: Creates user experience designs and design systems
- **Admin**: Handles project initialization and configuration

## 🚀 Getting Started

### 1. Set Up PODs Framework

```bash
# Clone the PODs framework to your project
git clone https://github.com/kevinstorberg/pods.git
cd pods

# Install dependencies
npm install
```

### 2. Configure AI Assistants

Edit the configuration file to set your preferred AI coding tools:

```bash
# Edit config/assistants.json
```

Example configuration:
```json5
{
  // Default AI assistant for all roles
  "default": "claude",

  // Role-specific overrides (uncomment as needed)
  "roles": {
    // "fullstack_engineer": "gemini",
    // "engineering_manager": "gemini"
  }
}
```

### 3. Configure MCP Servers (Optional)

Configure Model Context Protocol servers for enhanced AI capabilities:

```bash
# Edit config/mcp.json
# Supports JSONC format with comments
# Uncomment desired servers and add API keys
```

Example MCP configuration:
```json5
{
  "mcpServers": {
    // Uncomment and configure as needed
    // "figma-community": {
    //   "command": "npx",
    //   "args": ["-y", "figma-developer-mcp", "--figma-api-key=YOUR-KEY"],
    //   "env": {
    //     "FIGMA_ACCESS_TOKEN": "YOUR-FIGMA-API-KEY"
    //   }
    // },
    // "github": {
    //   "command": "npx",
    //   "args": ["-y", "@modelcontextprotocol/server-github"],
    //   "env": {
    //     "GITHUB_PERSONAL_ACCESS_TOKEN": "YOUR-GITHUB-TOKEN"
    //   }
    // }
  }
}
```

### 4. Initialize Project Context

Run the admin role to configure your project context:

```bash
# Make scripts executable (one-time setup)
chmod +x bin/pods bin/initialize

# Option 1: Use initialize script (recommended)
bin/initialize

# Option 2: Launch admin role directly
bin/pods admin
```

The admin will:
- Auto-detect your technology stack
- Ask smart questions about your business context
- Configure all project context files
- Prepare the framework for other roles

### 4. Use Roles Sequentially

Work through the role chain for your feature development:

```bash
bin/pods product-manager
bin/pods architect
bin/pods engineering-manager
bin/pods fullstack-engineer
bin/pods qa-engineer
```

## 📁 Repository Structure

```
pods/
├── bin/                     # Executable scripts
│   ├── initialize          # Project setup script
│   ├── pods                # Main role launcher
│   └── test               # Test suite runner
├── config/
│   ├── assistants.json     # AI assistant configuration
│   ├── mcp.json           # MCP server configuration
│   └── project.json       # Project directory configuration
├── contexts/               # Project context templates
│   ├── shared/            # Framework components
│   │   ├── common_constraints.md
│   │   ├── mcp_servers.md
│   │   ├── project_config.md
│   │   ├── scope_framework.md
│   │   └── technology_categories.md
│   ├── business_context.md
│   ├── customer_personas.md
│   ├── project_constraints.md
│   └── technical_context.md
├── roles/                   # AI role definitions
│   ├── shared/             # Common role components
│   │   ├── example_indicators.md
│   │   ├── handoff_requirements.md
│   │   ├── quality_standards.md
│   │   └── system_assessment_process.md
│   ├── admin.md
│   ├── architect.md
│   ├── designer.md
│   ├── engineering_manager.md
│   ├── fullstack_engineer.md
│   ├── product_manager.md
│   └── qa_engineer.md
├── templates/             # Output format templates
│   ├── shared/           # Common template components
│   ├── architecture_spec.md
│   ├── design_task.md
│   ├── implementation_plan.md
│   ├── qa_checklist.md
│   ├── requirements_doc.md
│   ├── test_strategy.md
│   ├── ticket_template.md
│   └── user_story.md
├── tests/                 # Test suite
│   └── test-roles.sh     # Role loading tests
└── branch/               # Generated content workspace (git-ignored)
```

## 🎨 Key Features

### Context-Driven Intelligence
- **Domain Agnostic**: Roles adapt to any industry through context injection
- **Project Aware**: Auto-detection of existing codebases and technology stacks
- **Constraint Conscious**: Respects timeline, budget, and technical limitations

### Template-Based Consistency
- **Standardized Outputs**: Consistent document formats across all roles
- **Variable Substitution**: Dynamic content generation with `{{VARIABLE}}` system
- **Modular Components**: DRY architecture with shared, reusable components

### Clean Workspace Management
- **Git-Ignored Generation**: All AI outputs go to `/branch` folder
- **Session Isolation**: Timestamped workspaces for parallel feature development
- **Version Control Friendly**: Framework stays clean, generated content stays separate

## 🤝 Contributing

We welcome contributions to make PODs more powerful and accessible! Here's how you can help:

### 🐛 Reporting Issues
- Use GitHub Issues to report bugs or request features
- Provide clear reproduction steps and context
- Include relevant project configuration and error messages

### 💡 Feature Requests
- Propose new roles, templates, or workflow improvements
- Share use cases and examples of how features would help
- Discuss ideas in GitHub Discussions before implementing

### 🔧 Code Contributions

#### Setting Up Development Environment
```bash
git clone https://github.com/kevinstorberg/pods.git
cd pods
# Install dependencies
npm install
# Make scripts executable
chmod +x bin/pods bin/initialize
# Configure assistants (edit config/assistants.json as needed)
# Configure MCP servers (edit config/mcp.json as needed)
# Test the framework
bin/pods admin
```

#### Contribution Guidelines
1. **Fork and Branch**: Create feature branches from `main`
2. **Follow Patterns**: Maintain consistency with existing role and template structures
3. **Test Thoroughly**: Validate changes across different project types
4. **Document Changes**: Update relevant documentation and examples
5. **Submit Pull Request**: Create a pull request with clear description of changes and testing performed

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- Built for the developer community who believes AI should augment, not replace, human creativity
- Inspired by Agile methodologies and modern software development practices
- Special thanks to **Ryan Storberg** and **Tarrus Richardson** for being invaluable thought partners in developing this framework
- Thanks to all contributors who help make software development more accessible and efficient

---

**Ready to revolutionize your development workflow?** Star the repo, try PODs with your next feature, and join our growing community of AI-augmented developers!