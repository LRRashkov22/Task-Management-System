using System;
using System.Collections.Generic;
using System.Text;
using TaskManagementSystem.Data.Domain.Enums;
using TaskManagementSystem.Modules.Statistics.Application.DTO_s;

namespace TaskManagementSystem.Modules.Statistics.Application.Interface
{
    public interface IGetAdminInformation
    {
        Task<List<GetUsersDto>> GetSearchEmployees(string? search, int page = 1, int pageSize = 10);
        Task<List<GetUsersDto>> GetAllUsersByRole(Role role);
        Task<DashboardDto> GetAdminDashboardInformation();
       // Task<DashboardDto> GetmanagerDashboardInformation();
       // Task<DashboardDto> GetUserDashboardInformation();
    }
}
