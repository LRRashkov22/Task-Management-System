using System;
using System.Collections.Generic;
using System.Text;
using TaskManagementSystem.Data.Domain.Entities;
using TaskManagementSystem.Data.Domain.Enums;
using TaskManagementSystem.Modules.Statistics.Application.DTOs.AdminDto;
using TaskManagementSystem.Modules.Statistics.Application.DTOs.ManagersDto;
using TaskManagementSystem.Modules.Statistics.Application.DTOs.Shared;

namespace TaskManagementSystem.Modules.Statistics.Application.Interfaces
{
    public interface IGetAdminInformation
    {
        Task<(GetPreviewOnDeletingManagerDto?, string?)> GetPreviewOnDeletingManager(int managerid);
        Task<List<GetUsersDto>> GetSearchEmployees(string? search, int page = 1, int pageSize = 10);
        Task<List<GetUsersDto>> GetAllUsersByRole(Role role);
        Task<DashboardDto> GetAdminDashboardInformation();
        Task<List<GetArchivedTeams>> GetAdminArchivedTeams();
        Task<List<GetNotificationsListDto>> GetNotificationsAsync(int userid);
        // Task<DashboardDto> GetmanagerDashboardInformation();
        // Task<DashboardDto> GetUserDashboardInformation();
    }
}
