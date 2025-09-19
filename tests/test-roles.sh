#!/bin/bash

# PODs Role Loading Tests
# Tests each role's metadata output for essential information
# Resilient to additions, fails only on destructive changes

set -e

# Source shared test utilities
source "$(dirname "${BASH_SOURCE[0]}")/shared.sh"

echo "🧪 PODs Role Loading Tests"
echo "=========================="
echo ""

# Test helper function
test_role() {
    local role_name=$1
    local expected_deliverables=$2
    local must_include_inputs=$3

    echo -e "${BLUE}Testing role: $role_name${NC}"

    # Capture role output
    local output
    output=$(timeout 60s bin/pods "$role_name" 2>&1 || echo "TIMEOUT_ERROR")

    # Check for timeout
    if [[ "$output" == *"TIMEOUT_ERROR"* ]]; then
        echo -e "  ${RED}❌ TIMEOUT${NC} - Role took too long to respond"
        increment_failed
        return
    fi

    # Check for errors
    if [[ "$output" == *"Error:"* ]] || [[ "$output" == *"error:"* ]]; then
        echo -e "  ${RED}❌ ERROR${NC} - Role failed to launch"
        echo "     Output: ${output:0:100}..."
        increment_failed
        return
    fi

    # Convert abbreviation to full name for role identification test
    local expected_role_name
    case "$role_name" in
        "ad") expected_role_name="admin" ;;
        "pm") expected_role_name="product_manager" ;;
        "ar") expected_role_name="architect" ;;
        "em") expected_role_name="engineering_manager" ;;
        "fe") expected_role_name="fullstack_engineer" ;;
        "qe") expected_role_name="qa_engineer" ;;
        "de") expected_role_name="designer" ;;
        *) expected_role_name="$role_name" ;;
    esac

    # Test 1: Role field exists and matches
    if [[ "$output" =~ ROLE:.*$expected_role_name ]]; then
        echo -e "  ${GREEN}✅ Role identification${NC}"
    else
        echo -e "  ${RED}❌ Role identification${NC} - Missing or incorrect ROLE field"
        increment_failed
        return
    fi

    # Test 2: Deliverables field exists and contains expected files
    if [[ "$output" =~ DELIVERABLES: ]]; then
        local deliverables_valid=true
        for deliverable in $expected_deliverables; do
            if [[ "$output" == *"$deliverable"* ]]; then
                echo -e "  ${GREEN}✅ Deliverable: $deliverable${NC}"
            else
                echo -e "  ${RED}❌ Missing deliverable: $deliverable${NC}"
                deliverables_valid=false
            fi
        done

        if [ "$deliverables_valid" = false ]; then
            increment_failed
            return
        fi
    else
        echo -e "  ${RED}❌ DELIVERABLES field missing${NC}"
        increment_failed
        return
    fi

    # Test 3: Key inputs are present (flexible - allows additions)
    if [[ "$output" =~ INPUTS: ]]; then
        local inputs_valid=true
        for input in $must_include_inputs; do
            if [[ "$output" == *"$input"* ]]; then
                echo -e "  ${GREEN}✅ Required input: $input${NC}"
            else
                echo -e "  ${RED}❌ Missing required input: $input${NC}"
                inputs_valid=false
            fi
        done

        if [ "$inputs_valid" = false ]; then
            increment_failed
            return
        fi
    else
        echo -e "  ${RED}❌ INPUTS field missing${NC}"
        increment_failed
        return
    fi

    # Test 4: PROJECT_DIRECTORY field exists
    if [[ "$output" =~ PROJECT_DIRECTORY: ]]; then
        echo -e "  ${GREEN}✅ Project directory configured${NC}"
    else
        echo -e "  ${RED}❌ PROJECT_DIRECTORY field missing${NC}"
        increment_failed
        return
    fi

    # Test 5: MCP_SERVERS field exists
    if [[ "$output" =~ MCP_SERVERS: ]]; then
        echo -e "  ${GREEN}✅ MCP servers field present${NC}"
    else
        echo -e "  ${RED}❌ MCP_SERVERS field missing${NC}"
        increment_failed
        return
    fi

    # Test 6: AI_ASSISTANT field exists
    if [[ "$output" =~ AI_ASSISTANT: ]]; then
        echo -e "  ${GREEN}✅ AI assistant identified${NC}"
    else
        echo -e "  ${RED}❌ AI_ASSISTANT field missing${NC}"
        increment_failed
        return
    fi

    # Test 7: STATUS field shows ready
    if [[ "$output" =~ STATUS:.*ready ]]; then
        echo -e "  ${GREEN}✅ Status ready${NC}"
    else
        echo -e "  ${RED}❌ STATUS not ready${NC}"
        increment_failed
        return
    fi

    echo -e "  ${GREEN}✅ $role_name role test PASSED${NC}"
    increment_passed
    echo ""
}

# Run tests for each role
echo "Testing all PODs roles..."
echo ""

# Test Admin (no deliverables, analyzes existing context)
test_role "admin" "" ""

# Test Product Manager
test_role "product_manager" "requirements_doc.md user_stories.md" ""

# Test Architect
test_role "architect" "architecture_spec.md" "requirements_doc.md user_stories.md"

# Test Engineering Manager
test_role "engineering_manager" "tickets.md implementation_plan.md" "requirements_doc.md architecture_spec.md"

# Test Fullstack Engineer (no specific deliverables - creates code)
test_role "fullstack_engineer" "" "requirements_doc.md architecture_spec.md tickets.md"

# Test QA Engineer
test_role "qa_engineer" "qa_report.md test_strategy.md" "requirements_doc.md architecture_spec.md tickets.md"

# Test Designer
test_role "designer" "design_task.md design_system.md" "requirements_doc.md user_stories.md"

echo ""
echo "Testing role abbreviations..."
echo ""

# Test all abbreviations work
test_role "ad" "" ""                    # admin
test_role "pm" "requirements_doc.md user_stories.md" ""  # product_manager
test_role "ar" "architecture_spec.md" "requirements_doc.md user_stories.md"  # architect
test_role "em" "tickets.md implementation_plan.md" "requirements_doc.md architecture_spec.md"  # engineering_manager
test_role "fe" "" "requirements_doc.md architecture_spec.md tickets.md"  # fullstack_engineer
test_role "qe" "qa_report.md test_strategy.md" "requirements_doc.md architecture_spec.md tickets.md"  # qa_engineer
test_role "de" "design_task.md design_system.md" "requirements_doc.md user_stories.md"  # designer

# Summary
print_test_summary "role loading tests"