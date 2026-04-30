using Microsoft.EntityFrameworkCore;
using System;
using System.Collections.Generic;
using System.Security.Principal;
using System.Text;
using TaskManagementSystem.Data.Domain.Entities;
using TaskManagementSystem.Data.Domain.Enums;
namespace TaskManagementSystem.Data.Persistance;

public class TMSDbContext(DbContextOptions<TMSDbContext> options) : DbContext(options)
{
    public DbSet<User> Users { get; set; }
  
}
