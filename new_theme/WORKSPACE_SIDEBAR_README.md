# Workspace-based Sidebar System

This document explains the new workspace-based sidebar system that replaces the old Custom Menu doctype dependency.

## Overview

The sidebar is now linked to Frappe Workspaces instead of the Custom Menu doctype. This provides better integration with Frappe's built-in workspace system and allows for more flexible menu management.

## Key Changes

### 1. Sidebar Unlinked from Menu DocType
- Removed dependency on Custom Menu doctype
- Sidebar now uses workspace data directly

### 2. Workspace Integration
- Sidebar is now linked to Frappe Workspaces
- Uses workspace "Link Cards" section for menu items
- Workspace name functions as module name

### 3. Card Break Menu System
- New "Card Break Menu" doctype for sub-menu items
- Items inside Card Break Menu become sub-menus
- Hierarchical menu structure: Workspace > Link Cards + Card Break Menus > Sub-menu Items

## New DocTypes

### Card Break Menu
- **Purpose**: Container for sub-menu items
- **Fields**:
  - `menu_name`: Name of the menu
  - `menu_icon`: Icon for the menu
  - `is_active`: Whether the menu is active
  - `sort_order`: Order of display
  - `description`: Description of the menu
  - `sub_menu_items`: Child table for menu items

### Card Break Menu Item
- **Purpose**: Individual sub-menu items
- **Fields**:
  - `item_label`: Display label
  - `link_type`: Type of link (Doctype, Page, Report, Link, Workspace)
  - `link_to`: Target of the link
  - `is_active`: Whether the item is active
  - `sort_order`: Order of display
  - `description`: Description of the item

## How It Works

1. **Workspace as Module**: Each workspace becomes a module in the sidebar
2. **Link Cards Integration**: Workspace links are displayed as menu items
3. **Card Break Menus**: Additional sub-menus can be created using Card Break Menu doctype
4. **Hierarchical Structure**: 
   - Workspace (Module)
     - Workspace Links (from Link Cards section)
     - Card Break Menus
       - Sub-menu Items

## Migration

A migration script is provided to help transition from the old Custom Menu system:
- Located at: `new_theme/patches/v1_0_0/migrate_to_workspace_sidebar.py`
- Creates workspaces from existing Custom Menu records
- Converts menu items to Card Break Menu items

## API Endpoints

### Get Workspace Sidebar
- **Method**: `new_theme.api.workspace_sidebar.get_workspace_sidebar`
- **Returns**: Workspace-based sidebar configuration

### Clear Cache
- **Method**: `new_theme.api.workspace_sidebar.clear_workspace_sidebar_cache`
- **Purpose**: Clear sidebar cache

## CSS Classes

New CSS classes for the workspace-based sidebar:
- `.nt-nav-section`: Section container
- `.nt-nav-group`: Workspace group
- `.nt-nav-sub-group`: Card Break Menu group
- `.nt-nav-item`: Individual menu item
- `.nt-nav-head`: Workspace header
- `.nt-nav-sub-head`: Card Break Menu header
- `.nt-nav-sub-item`: Workspace link item
- `.nt-nav-sub-item-2`: Card Break Menu item
- `.nt-sublist`: Submenu container
- `.nt-sublist-2`: Nested submenu container

## Benefits

1. **Better Integration**: Uses Frappe's native workspace system
2. **More Flexible**: Can leverage workspace features like roles, permissions
3. **Consistent**: Aligns with Frappe's workspace-based approach
4. **Scalable**: Easier to manage large menu structures
5. **Maintainable**: Reduces custom code dependency

## Usage

1. Create workspaces in Frappe
2. Add links to workspace "Link Cards" section
3. Create Card Break Menus for additional sub-menus
4. Add items to Card Break Menus as needed
5. Sidebar will automatically reflect the workspace structure

## Backward Compatibility

The system maintains backward compatibility by:
- Keeping the old Custom Menu API as fallback
- Providing migration script for existing data
- Graceful degradation if workspace data is not available
