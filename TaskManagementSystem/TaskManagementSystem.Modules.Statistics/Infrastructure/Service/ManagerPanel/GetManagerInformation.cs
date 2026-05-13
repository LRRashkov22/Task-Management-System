using Microsoft.EntityFrameworkCore;
using TaskManagementSystem.Data.Persistance;
using TaskManagementSystem.Modules.Statistics.Application.DTO_s.ManagersDto;
using TaskManagementSystem.Modules.Statistics.Application.Interface;
namespace TaskManagementSystem.Modules.Statistics.Infrastructure.Service.NewFolder;

public class GetManagerInformation : IGetManagerInformation
{
    private readonly TaskManagementDbContext context;
    public GetManagerInformation(TaskManagementDbContext context)
    {
        this.context = context;
    }

    public async Task<List<GetTeamDto>> GetAllTeamsAsync(int userid)
    {
        var managerExists = await context.Users.AnyAsync(m => m.Id == userid);
        // if (!managerExists) throw new Exception("Error finding teams");
        var teams = await context.Teams
            .Include(t => t.Manager)
            .Include(t => t.Memberships)
                .ThenInclude(m => m.User)
            .Include(t => t.Tasks)
            .Where(t => t.ManagerId == userid)
            .ToListAsync();

        return teams.Select(t => new GetTeamDto
        {
            Id = t.Id,
            Name = t.Name,
            ManagerId = t.ManagerId,
            ManagerUsername = t.Manager.Username,
            EmployeesCount = t.Memberships.Count,
            TasksCount = t.Tasks!.Count,
            Members = t.Memberships.Select(m =>
            new MemberDto
            {
                Id = m.UserId,
                Username = m.User.Username
            }).ToList(),
            Tasks = t.Tasks!.Select(task =>
            new TaskDto
            {
                Id = task.Id,
                Title = task.Title
            }).ToList()
        }).ToList();
    }
}
