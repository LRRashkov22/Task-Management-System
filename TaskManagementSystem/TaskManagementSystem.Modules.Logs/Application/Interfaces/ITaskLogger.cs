using System;
using System.Collections.Generic;
using System.Text;
using TaskManagementSystem.Data.Domain.Entities;
using TaskManagementSystem.Modules.Logs.Application.DTOs;

namespace TaskManagementSystem.Modules.Logs.Application.Interfaces;

public interface ITaskLogger
{
    Task TaskAssignedLog(
        CreateLogDto createLogDto,
        TaskItem task,
        IEnumerable<int> assignedUserIdss,
        string managerName);
    Task TaskRecoverLog(
        CreateLogDto createLogDto,
        TaskItem task);
    Task TaskArchivedLog(
        CreateLogDto createLogDto, 
        TaskItem task);
    Task TaskTransferedLog(
        CreateLogDto createLogDto, 
        TaskItem task,
        IEnumerable<int> oldAssignedUsers);
    Task TaskEditLog(
        CreateLogDto createLogDto, 
        TaskItem task,
        IEnumerable<int> removedUsers, 
        IEnumerable<int> addedUsers);
}
