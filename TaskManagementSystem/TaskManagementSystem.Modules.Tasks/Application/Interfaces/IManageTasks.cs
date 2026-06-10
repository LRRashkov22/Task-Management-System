using System;
using System.Collections.Generic;
using System.Text;
using System.Threading.Tasks;
using TaskManagementSystem.Data.Domain.Entities;
using TaskManagementSystem.Data.Domain.Enums;
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
        Task<(bool status, string? error)> AdminRecoverTask(RecoverOrArchiveDto request,int userid);
        Task<(bool? status, string? error)> TransferTaskAsync(TransferTaskDto request, int userid, bool isAdmin);
        Task<(bool status, string? error)> DeleteArchivedTaskAsync(int taskId);
        Task<(bool?, string?)> EditTaskAsync(int userid, int taskid, EditTaskDto request);
        Task<(bool?, string?)> RequestReviewTaskAsync(int userid, int taskid);
        Task<(bool?, string?)> MarkAsDone(int userid, int taskid);

        //user proprietary tasks methods
        Task<List<PersonalTaskCardDto>> GetPersonalTasksAsync(int userid);
        Task<(PersonalTaskCardDto?, string?)> CreatePersonalTaskAsync(CreatePersonalTaskDto request, int userid);
        Task<(bool status, string? error)> ChangePersonalTaskStatusAsync(int userid, int taskid, Status newStatus);
        Task<(bool status, string? error)> DeletePersonalTaskAsync(int userid, int taskid);

        Task<PersonalTaskCardDto?> GetPersonalTaskDetailsAsync(int taskId, int userid);
    }
}
