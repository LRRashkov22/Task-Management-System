using System;
using System.Collections.Generic;
using System.Text;
using TaskManagementSystem.Data.Domain.Entities;
using TaskManagementSystem.Data.Domain.Enums;
using TaskManagementSystem.Modules.Identity.Application.DTOs;

namespace TaskManagementSystem.Modules.Identity.Application.Interfaces;

public interface ICreateUser
{
    Task<(User? user, string? error)> RegisterUser(CreateUserDto request);
}
