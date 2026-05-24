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
}