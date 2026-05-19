using TaskManagementSystem.Modules.Statistics.Application.DTO_s.ManagersDto;

namespace TaskManagementSystem.Modules.Statistics.Application.Interface
{
    public interface  IGetManagerInformation
    {
        Task<List<GetTeamDto>> GetAllTeamsManagerListAsync(int userid);
        Task<GetTeamDto?> GetTeamDetailsAsync(int userid, int teamId);
        Task<(TransferTeamPreviewDto? preview, string? error)> GetTransferTeamPreviewAsync(int teamId);
        Task<List<MemberDto>?> GetAllManagerEmployees(int userid);
        Task<List<ManagerTeamDropdownDto>> GetManagerDropdownTeamsAsync(int userid);
    }
}
