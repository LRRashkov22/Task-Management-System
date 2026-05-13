using TaskManagementSystem.Modules.Statistics.Application.DTO_s.ManagersDto;

namespace TaskManagementSystem.Modules.Statistics.Application.Interface
{
    public interface  IGetManagerInformation
    {
        //Task<(GetTeamDto? team, string? error)> GetTeamById(int id);
         Task<List<GetTeamDto>> GetAllTeamsAsync(int userid);
    }
}
