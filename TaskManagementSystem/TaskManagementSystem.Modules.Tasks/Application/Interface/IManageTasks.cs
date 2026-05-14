using System;
using System.Collections.Generic;
using System.Text;
using TaskManagementSystem.Data.Domain.Entities;
using TaskManagementSystem.Modules.Tasks.Application.Dto;

namespace TaskManagementSystem.Modules.Tasks.Application.Interface
{
    public interface IManageTasks
    {

        Task<(CreateTaskDto?, string?)> CreateTaskAsync(CreateTaskDto request, int userid);
    }
}
