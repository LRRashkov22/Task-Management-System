using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using System.Security.Claims;
using TaskManagementSystem.Data.Domain.Entities;
using TaskManagementSystem.Data.Domain.Enums;
using TaskManagementSystem.Modules.Statistics.Application.DTO_s;
using TaskManagementSystem.Modules.Statistics.Application.Interface;

namespace TaskManagementSystem.Modules.Statistics.Presentation;
[ApiController]
[Route("api/Statistics/Manager")]

public class ManagerInformationController : ControllerBase
{
    private readonly IGetManagerInformation managerInfo;
    public ManagerInformationController(IGetManagerInformation managerInfo)
    {
        this.managerInfo = managerInfo;
    }


    [Authorize(Roles = "Manager")]
    [HttpGet("get-all-teams")]
    public async Task<ActionResult> GetTeam()
    {
        var userid = int.Parse(User.FindFirst(ClaimTypes.NameIdentifier)?.Value!);
        var teams = await managerInfo.GetAllTeamsAsync(userid);
        return Ok(teams);
    }
}
