using TaskManagementSystem.Modules.Statistics.Application.DTOs.ManagersDto;
using TaskManagementSystem.Modules.Statistics.Application.DTOs.Shared;

namespace TaskManagementSystem.Modules.Statistics.Application.Interfaces
{
    public interface  IGetManagerInformation
    {
        Task<List<GetTeamDto>> GetAllTeamsManagerListAsync(int userid);
        Task<GetTeamDto?> GetTeamDetailsAsync(int userid, int teamId);
        Task<List<CalendarDto>> GetCalendarTaskInformation(int userid);
        Task<(TransferTeamPreviewDto? preview, string? error)> GetTransferTeamPreviewAsync(int teamId);
        Task<List<MemberDto>> GetAllManagerEmployees(int userid);
        Task<List<ManagerTeamDropdownDto>> GetManagerDropdownTeamsAsync(int userid);
    }
}
