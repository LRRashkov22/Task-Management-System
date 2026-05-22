using Microsoft.EntityFrameworkCore;
using TaskManagementSystem.Data.Persistance;
using TaskManagementSystem.Modules.Statistics.Application.DTO_s;
using TaskManagementSystem.Modules.Statistics.Application.DTOs.ManagersDto;
using TaskManagementSystem.Modules.Statistics.Application.Interfaces;
namespace TaskManagementSystem.Modules.Statistics.Application.Services.ManagerPanel;

public class GetManagerInformation : IGetManagerInformation
{
    private readonly TaskManagementDbContext context;
    public GetManagerInformation(TaskManagementDbContext context)
    {
        this.context = context;
    }
    //shows list of names of teams of the current manager
    public async Task<List<ManagerTeamDropdownDto>> GetManagerDropdownTeamsAsync(int userid)
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

    //show only when page requested / show.
    //shows in dashboad and team page in Mnagaer panel.
    public async Task<List<GetTeamDto>> GetAllTeamsManagerListAsync(int userid)
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
            TasksCount = context.TaskItems.Count(x => x.TeamId == t.Id && !x.IsArchived)
        }).ToList();
    }
    public async Task<(TransferTeamPreviewDto? preview, string? error)> GetTransferTeamPreviewAsync(int teamId)
    {
        var team = await context.Teams
            .AsNoTracking()
            .Include(t => t.Manager)
            .Include(t => t.Memberships)
            .Include(t => t.Tasks.Where(task => !task.IsArchived))
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
            .Include(t => t.Tasks.Where(task => !task.IsArchived))
                .ThenInclude(task => task.Assignments)
                    .ThenInclude(a => a.User)
            .Include(t => t.Tasks.Where(task => !task.IsArchived))
                .ThenInclude(task => task.WorkSessions)
            .FirstOrDefaultAsync();

        if (team == null) return null;

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
                }).ToList(),
                Tasks = team.Tasks
                .Select(task => new TeamTaskCardDto
                {
                    Id = task.Id,
                    Title = task.Title,
                    Description = task.Description,
                    Status = task.Status.ToString(),
                    Priority = task.Priority.ToString(),
                    Deadline = task.Deadline,
                    AssignedEmployeesCount = task.Assignments.Count,
                    WorkHours = task.WorkSessions.Sum(w => w.Hours),
                    AssignedEmployees = task.Assignments
                        .Select(a => new MemberDto
                        {
                            Id = a.UserId,
                            Username = a.User.Username
                        }).ToList()
                }).ToList()};
    }

    public async Task<List<MemberDto>> GetAllManagerEmployees(int userid) {
        return await context.Users.AsNoTracking()
            .Where(m => m.ManagerId == userid)
            .Select(m => new MemberDto
            {
                Id = m.Id,
                Username = m.Username
            }).ToListAsync();
    }

    public async Task<List<CalendarDto>> GetCalendarTaskInformation(int userid)
    {
        var tasks = await context.TaskItems.AsNoTracking()
            .Where(t => t.Team.ManagerId == userid && !t.IsArchived)
            .Select(t => new CalendarDto
            {
                TaskName = t.Title,
                TeamName = t.Team.Name,
                Deadline = t.Deadline,
                Status = t.Status,
                StartDate = t.CreatedAt
            }).ToListAsync();
        return tasks;
    }


}
