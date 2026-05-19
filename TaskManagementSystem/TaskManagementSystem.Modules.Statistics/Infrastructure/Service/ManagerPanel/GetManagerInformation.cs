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

    public async Task<List<ManagerTeamDropdownDto>> GetManagerTeamsAsync(int userid)
    {
        return await context.Teams
            .AsNoTracking()
            .Where(t =>
                !t.IsArchived &&
                t.ManagerId == userid)
            .OrderBy(t => t.Name)
            .Select(t => new ManagerTeamDropdownDto
            {
                Id = t.Id,
                Name = t.Name
            }).ToListAsync();
    }

    //show only when page requested
    public async Task<List<GetTeamDto>> GetAllTeamsListAsync(int userid)
    {
        var managerExists = await context.Users.AsNoTracking().AnyAsync(m => m.Id == userid);
        // if (!managerExists) throw new Exception("Error finding teams");
        var teams = await context.Teams
            .AsNoTracking()
            .Where(t => !t.IsArchived)
            .Where(t => t.ManagerId == userid)
            .Include(t => t.Memberships)
                .ThenInclude(m => m.User)
            .ToListAsync();

        return teams.Select(t => new GetTeamDto
        {
            Id = t.Id,
            Name = t.Name,
            ManagerId = t.ManagerId,
            EmployeesCount = t.Memberships.Count,
            TasksCount = context.TaskItems.Count(x => x.TeamId == t.Id)
        }).ToList();
    }
    public async Task<(TransferTeamPreviewDto? preview, string? error)> GetTransferTeamPreviewAsync(int teamId)
    {
        var team = await context.Teams
            .AsNoTracking()
            .Include(t => t.Manager)
            .Include(t => t.Memberships)
            .Include(t => t.Tasks)
            .FirstOrDefaultAsync(t => t.Id == teamId);

        if (team == null)
            return (null, "Team not found");

        var result = new TransferTeamPreviewDto
        {
            TeamId = team.Id,
            TeamName = team.Name,
            MembersCount = team.Memberships.Count,
            TasksCount = team.Tasks.Count,
            CurrentManagerName = team.Manager.Username
        };

        return (result, null);
    }

    //click show details
    public async Task<GetTeamDto?> GetTeamDetailsAsync(int userid, int teamId)
    {
        var team = await context.Teams
            .AsNoTracking()
            .Where(t =>
                !t.IsArchived &&
                t.ManagerId == userid &&
                t.Id == teamId)
            .Include(t => t.Memberships)
                .ThenInclude(m => m.User)
            .Include(t => t.Tasks)
                .ThenInclude(task => task.Assignments)
                    .ThenInclude(a => a.User)
            .Include(t => t.Tasks)
                .ThenInclude(task => task.WorkSessions)
            .FirstOrDefaultAsync();

        if (team == null)
            return null;

        return new GetTeamDto
        {
            Id = team.Id,
            Name = team.Name,
            ManagerId = team.ManagerId,

            EmployeesCount = team.Memberships.Count,

            TasksCount = team.Tasks.Count,

            Members = team.Memberships
                .Select(m => new MemberDto
                {
                    Id = m.UserId,
                    Username = m.User.Username
                })
                .ToList(),

            Tasks = team.Tasks
                .Select(task => new TeamTaskCardDto
                {
                    Id = task.Id,
                    Title = task.Title,
                    Description = task.Description,
                    Status = task.Status.ToString(),
                    Priority = task.Priority.ToString(),
                    Deadline = task.Deadline,

                    AssignedEmployeesCount =
                        task.Assignments.Count,

                    WorkHours =
                        task.WorkSessions.Sum(w => w.Hours),

                    AssignedEmployees = task.Assignments
                        .Select(a => new MemberDto
                        {
                            Id = a.UserId,
                            Username = a.User.Username
                        })
                        .ToList()
                })
                .ToList()
        };
    }
}
