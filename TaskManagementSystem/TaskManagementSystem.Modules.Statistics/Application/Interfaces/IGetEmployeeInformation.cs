using System;
using System.Collections.Generic;
using System.Text;
using TaskManagementSystem.Modules.Statistics.Application.DTOs.EmployeeDto;
using TaskManagementSystem.Modules.Statistics.Application.DTOs.Shared;

namespace TaskManagementSystem.Modules.Statistics.Application.Interfaces
{
    public interface IGetEmployeeInformation
    {
        Task<EmployeeDashboardDto> GetEmployeeDashboardAsync(int userid);
        Task<List<EmployeeTaskPreviewDto>> GetEmployeeTasksPreviewAsync(int userid);
        Task<TaskDetailsDto?> GetEmployeeTaskDetailsAsync(int taskId, int userid);
    }
}
