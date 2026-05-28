using Microsoft.EntityFrameworkCore;
using System;
using System.Collections.Generic;
using System.Text;
using TaskManagementSystem.Data.Domain.Entities;
using TaskManagementSystem.Data.Domain.Interfaces;
using TaskManagementSystem.Data.Persistance;
using TaskManagementSystem.Modules.Logs.Application.Interfaces;

namespace TaskManagementSystem.Modules.Logs.Application.Services;

public class AppLogger : IAppLogger
{
    private readonly ICRUDLogService _logService;
    public AppLogger(ICRUDLogService logService)
    {
        _logService = logService;
    }

    
}