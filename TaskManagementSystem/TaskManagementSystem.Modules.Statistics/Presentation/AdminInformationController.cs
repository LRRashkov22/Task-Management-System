using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using TaskManagementSystem.Modules.Statistics.Application.DTO_s;
using TaskManagementSystem.Data.Domain.Enums;
using TaskManagementSystem.Modules.Statistics.Application.Interface;
namespace TaskManagementSystem.Modules.Statistics.Presentation;

[ApiController]
[Route("api/Statistics")]
public class AdminInformationController : ControllerBase
{
    private readonly IGetAdminInformation adminInfo;
    public AdminInformationController(IGetAdminInformation adminInfo)
    {
        this.adminInfo = adminInfo;
    }

    //Get Managers
    [Authorize(Roles = "Admin")]
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
