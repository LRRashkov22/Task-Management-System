using System;
using System.Collections.Generic;
using System.Text;
using TaskManagementSystem.Data.Domain.Entities;

namespace TaskManagementSystem.Data.Domain.Interfaces;

public interface IAppLogger
{
    Task<(bool isCreate, string? error)> CreateLog(Log request);

}