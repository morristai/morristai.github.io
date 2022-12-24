# Configure the Azure provider
terraform {
  required_providers {
    azurerm = {
      source  = "hashicorp/azurerm"
      version = "~> 3.37.0"
    }
  }

  required_version = ">= 1.3.6"
}

provider "azurerm" {
  features {}
}

resource "azurerm_resource_group" "blog" {
  name     = "morristai-blog-rg"
  location = "eastus"
}

resource "azurerm_storage_account" "blog" {
  name                     = "storagemorristaiblog"
  resource_group_name      = azurerm_resource_group.blog.name
  location                 = azurerm_resource_group.blog.location
  account_tier             = "Standard"
  account_replication_type = "GRS"
#   account_kind             = "StorageV2"

  tags = {
    # environment = "staging"
  }
}

# azurerm_static_site is currently useless
# resource "azurerm_static_site" "blog" {
#   name                = "morristaiblog"
#   resource_group_name = azurerm_resource_group.blog.name
#   location            = "eastus2"
# }
