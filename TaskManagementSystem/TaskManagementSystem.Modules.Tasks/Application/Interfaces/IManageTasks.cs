using System;
using System.Collections.Generic;
using System.Text;
using System.Threading.Tasks;
using TaskManagementSystem.Data.Domain.Entities;
using TaskManagementSystem.Modules.Tasks.Application.DTOs;

namespace TaskManagementSystem.Modules.Tasks.Application.Interfaces
{
    public interface IManageTasks
    {
        Task<List<TaskCardDto>> GetBoardTasks(int userid);
        Task<TaskDetailsDto?> GetTaskDetails(int taskId,int userid);
        Task<List<GetArchivedTaskDto>> GetAdminArchivedTasks();
        Task<(bool?, string?)> ChangeStausOnTaskAsync(int userid, int taskid, ChangeStatusOnTaskDto request);
        Task<(CreateTaskDto?, string?)> CreateTaskAsync(CreateTaskDto request, int userid);
        Task<(bool isDeleted, string? error)> ArchiveTask(RecoverOrArchiveDto request, int userid);
        Task<(bool status, string? error)> AdminRecoverTask(RecoverOrArchiveDto request);
        Task<(bool? status, string? error)> TransferTaskAsync(TransferTaskDto request, int userid, bool isAdmin);
        Task<(bool status, string? error)> DeleteArchivedTaskAsync(int taskId);
    }
}
