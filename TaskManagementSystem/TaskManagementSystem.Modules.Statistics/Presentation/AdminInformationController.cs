using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using System.Security.Claims;
using TaskManagementSystem.Data.Domain.Enums;
using TaskManagementSystem.Modules.Statistics.Application.DTOs.AdminDto;
using TaskManagementSystem.Modules.Statistics.Application.Interfaces;
namespace TaskManagementSystem.Modules.Statistics.Presentation;

[ApiController]
[Route("api/Statistics/Admin")]
public class AdminInformationController : ControllerBase
{
    private readonly IGetAdminInformation adminInfo;
    public AdminInformationController(IGetAdminInformation adminInfo)
    {
        this.adminInfo = adminInfo;
    }

    [Authorize]
    [HttpGet("get-Notifications-List")]
    public async Task<ActionResult> GetNotifications()
    {
        var userid = int.Parse(User.FindFirst(ClaimTypes.NameIdentifier)?.Value!);
        var result = await adminInfo.GetNotificationsAsync(userid);
        return Ok(result);
    }

    [Authorize(Roles = "Admin")]
    [HttpGet("get-admin-preview-OnDelete/{managerid}")]
    public async Task<ActionResult> GetAdminPreviewOnDeletManager(int managerid)
    {
        var (result, error) = await adminInfo.GetPreviewOnDeletingManager(managerid);
        if (error != null) return BadRequest(error);
        return Ok(result);
    }

    [Authorize(Roles = "Admin")]
    [HttpGet("get-archived-teams")]
    public async Task<ActionResult> GetArchivedTeams()
    {
        var teams = await adminInfo.GetAdminArchivedTeams();
        return Ok(teams);
    }

    //Get Managers
    [Authorize(Roles = "Admin,Manager")]
    [HttpGet("get-managers")]
    public async Task<ActionResult<List<UserDto>>> GetAllManagers()
    {
        var result = await adminInfo.GetAllUsersByRole(Role.Manager);
        return Ok(result);
    }
    //Get Employees
    [Authorize(Roles = "Admin")]
    [HttpGet("get-employee")]
    public async Task<ActionResult<List<UserDto>>> GetAllEmployees()
    {
        var result = await adminInfo.GetAllUsersByRole(Role.Employee);
        return Ok(result);
    }
    //Get The Count Of Employees, Managers, Tasks, Teams For Admin Dashboard
    [Authorize(Roles = "Admin")]
    [HttpGet("get-Admin-Dashboard")]
    public async Task<ActionResult> GetAdminDashboardInfo()
    {
        var result = await adminInfo.GetAdminDashboardInformation();
        return Ok(result);
    }


    [Authorize(Roles = "Admin")]
    [HttpGet("search-employee")]
    public async Task<ActionResult> SearchEmployee([FromQuery]string text,
        [FromQuery] int page = 1, [FromQuery] int pageSize = 10)
    {
        var result = await adminInfo.GetSearchEmployees(text, page, pageSize);
        return Ok(result);
    }
}
