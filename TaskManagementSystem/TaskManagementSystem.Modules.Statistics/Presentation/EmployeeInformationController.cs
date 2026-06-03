using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using System.Security.Claims;
using TaskManagementSystem.Modules.Statistics.Application.Interfaces;

namespace TaskManagementSystem.Modules.Statistics.Presentation;

[ApiController]
[Route("api/employee")]
public class EmployeeInformationController : ControllerBase
{
    private readonly IGetEmployeeInformation
        employeeInformation;

    public EmployeeInformationController(
        IGetEmployeeInformation employeeInformation)
    {
        this.employeeInformation = employeeInformation;
    }

    [Authorize(Roles = "Employee")]
    [HttpGet("dashboard")]
    public async Task<IActionResult> GetDashboard()
    {
        var userid = int.Parse( User.FindFirst(ClaimTypes.NameIdentifier)!.Value);
        var result = await employeeInformation.GetEmployeeDashboardAsync(userid);
        return Ok(result);
    }
    [Authorize(Roles = "Employee")]
    [HttpGet("TaskPreview")]
    [HttpGet("task-preview")]
    public async Task<IActionResult> GetTaskPreview()
    {
        var userid = int.Parse(User.FindFirst(ClaimTypes.NameIdentifier)!.Value);
        var result = await employeeInformation.GetEmployeeTasksPreviewAsync(userid);
        return Ok(result);
    }

    [Authorize(Roles = "Employee")]
    [HttpGet("TaskDetailed/{taskid}")]
    [HttpGet("task-detailed/{taskid}")]
    public async Task<IActionResult> GetTaskDetailed(int taskid)
    {
        var userid = int.Parse(User.FindFirst(ClaimTypes.NameIdentifier)!.Value);
        var result = await employeeInformation.GetEmployeeTaskDetailsAsync(taskid, userid);
        return Ok(result);
    }


    [Authorize(Roles = "Employee,Manager")]
    [HttpGet("CommentSearchEmployee/{taskid}")]
    public async Task<IActionResult> GetCommentSearchEmployee(
        int taskid,
        [FromQuery] string? search = null)
    {
        var result = await employeeInformation.GetCommentMentionSearchAsync(search, taskid);
        return Ok(result);
    }

}
