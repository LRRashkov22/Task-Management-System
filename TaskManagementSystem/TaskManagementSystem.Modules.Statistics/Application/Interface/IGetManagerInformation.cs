using TaskManagementSystem.Modules.Statistics.Application.DTO_s.ManagersDto;

namespace TaskManagementSystem.Modules.Statistics.Application.Interface
{
    public interface  IGetManagerInformation
    {
        //Task<(GetTeamDto? team, string? error)> GetTeamById(int id);
        Task<List<GetTeamDto>> GetAllTeamsListAsync(int userid);
        Task<GetTeamDto?> GetTeamDetailsAsync(int userid, int teamId);
        Task<(TransferTeamPreviewDto? preview, string? error)> GetTransferTeamPreviewAsync(int teamId);
        Task<List<ManagerTeamDropdownDto>> GetManagerTeamsAsync(int userid);

    }
}
