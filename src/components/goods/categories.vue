<template>
  <div>
    <!-- 面包屑导航 -->
    <el-breadcrumb separator="/">
      <el-breadcrumb-item :to="{ path: '/home' }">首页</el-breadcrumb-item>
      <el-breadcrumb-item>商品管理</el-breadcrumb-item>
      <el-breadcrumb-item>商品分类</el-breadcrumb-item>
    </el-breadcrumb>
    <!-- 卡片视图区域 -->
    <el-card>
      <el-row>
        <el-col>
          <el-button type="primary" @click="showAddCateDialog">添加分类</el-button>
        </el-col>
      </el-row>
      <!-- 表格 -->
      <tree-table
        :data="catelist"
        :columns="columns"
        :selection-type="false"
        :expand-type="false"
        :show-index="true"
        border
        class="tree-table"
      >
        <!-- 是否有效 -->
        <template slot="isok" slot-scope="scope">
          <i
            class="el-icon-success"
            v-if="scope.row.cat_deleted === false"
            style="color:lightgreen"
          ></i>
          <i class="el-icon-error" v-else style="color:lightgreen"></i>
        </template>
        <!-- 排序 -->
        <template slot="order" slot-scope="scope">
          <el-tag size="mini" v-if="scope.row.cat_level === 0">一级</el-tag>
          <el-tag type="success" size="mini" v-else-if="scope.row.cat_level === 1">二级</el-tag>
          <el-tag type="warning" size="mini" v-else>三级</el-tag>
        </template>
        <!-- 操作 -->
        <template slot="opt" slot-scope="scope">
          <el-button type="primary" icon="el-icon-edit" @click="showEditDialogVisible(scope.row)">编辑</el-button>
          <el-button type="danger" icon="el-icon-delete" @click="deleteCate(scope.row)">删除</el-button>
        </template>
      </tree-table>
      <!-- 分页区域 -->
      <el-pagination
        @size-change="handleSizeChange"
        @current-change="handleCurrentChange"
        :current-page="querInfo.pagenum"
        :page-sizes="[3, 5, 10, 15]"
        :page-size="querInfo.pagesize"
        layout="total, sizes, prev, pager, next, jumper"
        :total="total"
      ></el-pagination>
    </el-card>
    <!-- 添加分类对话框 -->
    <el-dialog
      title="添加分类"
      :visible.sync="addCateDialogVisible"
      width="50%"
      @close="addCateDialogClosed"
    >
      <!-- 主体 -->
      <el-form
        :model="addCateForm"
        :rules="addCateFormRules"
        ref="addCateFormRef"
        label-width="100px"
      >
        <el-form-item label="分类名称：" prop="cat_name">
          <el-input v-model="addCateForm.cat_name"></el-input>
        </el-form-item>
        <el-form-item label="父级分类：">
          <!-- options绑定数据 -->
          <el-cascader
            v-model="selectedKeys"
            :options="parentCateList"
            :props="{ expandTrigger: 'hover',value:'cat_id',label:'cat_name',children:'children',checkStrictly:true}"
            @change="parentCateChanged"
          ></el-cascader>
        </el-form-item>
      </el-form>
      <!-- 底部 -->
      <span slot="footer" class="dialog-footer">
        <el-button @click="addCateDialogVisible = false">取 消</el-button>
        <el-button type="primary" @click="addCate">确 定</el-button>
      </span>
    </el-dialog>
    <!-- 修改分类区域 -->
    <el-dialog title="修改分类" :visible.sync="editDialogVisible" width="50%">
      <!-- 主体 -->
      <el-form ref="editFormRef" :model="editForm" label-width="80px" :rules="addCateFormRules">
        <el-form-item label="分类名称" prop="cat_name">
          <el-input v-model="editForm.cat_name"></el-input>
        </el-form-item>
      </el-form>
      <!-- 底部 -->
      <span slot="footer" class="dialog-footer">
        <el-button @click="editDialogVisible = false">取 消</el-button>
        <el-button type="primary" @click="editCate">确 定</el-button>
      </span>
    </el-dialog>
    <!-- 删除分类区域 -->
  </div>
</template>

<script>
export default {
  data() {
    return {
      //商品分类的数据列表
      catelist: [],
      //查询条件
      querInfo: {
        type: 3,
        pagenum: 1,
        pagesize: 5
      },
      //商品分类总数
      total: 0,
      //为table指定列的定义
      columns: [
        {
          label: "分类名称",
          prop: "cat_name"
        },
        {
          label: "是否有效",
          //表示当前列定义为末班列
          type: "template",
          //表示当前这一列使用的模板名称
          template: "isok"
        },
        {
          label: "排序",
          type: "template",
          template: "order"
        },
        {
          label: "操作",
          type: "template",
          template: "opt"
        }
      ],
      //控制添加分类对话框的显示与隐藏
      addCateDialogVisible: false,
      //添加分类的表单对象
      addCateForm: {
        //分类名称
        cat_name: "",
        cat_pid: 0,
        //分类的等级默认为一级分类
        cat_level: 0
      },
      //表单校验规则
      addCateFormRules: {
        cat_name: [
          { required: true, message: "请输入分类名称", trigger: "blur" }
        ]
      },
      //父级分类的列表
      parentCateList: [],
      //选中的父级分类ID数组
      selectedKeys: [],
      //控制修改分类对话框的显示和隐藏
      editDialogVisible: false,
      //修改分类表单对象
      editForm: {
        cat_name: "",
        cat_id: 0
      }
    };
  },
  created() {
    this.getCateList();
  },
  methods: {
    getCateList() {
      this.$http
        .get("categories", {
          params: this.querInfo
        })
        .then(res => {
          console.log(res);
          if (res.data.meta.status !== 200)
            return this.$message.error("获取商品分类失败");
          //把数据列表赋值给catelist
          this.catelist = res.data.data.result;
          this.total = res.data.data.total;
        });
    },
    //监听pagesize改变
    handleSizeChange(newSize) {
      this.querInfo.pagesize = newSize;
      this.getCateList();
    },
    //监听pagenum改变
    handleCurrentChange(newPage) {
      this.querInfo.pagenum = newPage;
      this.getCateList();
    },
    showAddCateDialog() {
      this.getParentCateList();
      this.addCateDialogVisible = true;
    },
    //获取父级分类的数据列表
    getParentCateList() {
      this.$http.get("categories", { params: { type: 2 } }).then(res => {
        console.log(res);
        if (res.data.meta.status !== 200)
          return this.$message.error("获取父级分类数据失败");
        this.parentCateList = res.data.data;
      });
    },
    //选择项发生变化出发这个函数
    parentCateChanged() {
      console.log(this.selectedKeys);
      if (this.selectedKeys.length > 0) {
        //父级分类的id
        this.addCateForm.cat_pid = this.selectedKeys[
          this.selectedKeys.length - 1
        ];
        this.addCateForm.cat_level = this.selectedKeys.length;
      } else {
        this.addCateForm.cat_pid = 0;
        this.addCateForm.cat_level = 0;
      }
    },
    //点击按钮添加新分类
    addCate() {
      this.$refs.addCateFormRef.validate(valid => {
        if (!valid) return;
        this.$http
          .post("categories", {
            cat_pid: this.addCateForm.cat_pid,
            cat_name: this.addCateForm.cat_name,
            cat_level: this.addCateForm.cat_level
          })
          .then(res => {
            if (res.data.meta.status !== 201)
              return this.$message.error("添加分类失败！");
            this.$message.success("添加分类成功！");
            this.getCateList();
            this.addCateDialogVisible = false;
          });
      });
    },
    //关闭表单重置数据
    addCateDialogClosed() {
      this.$refs.addCateFormRef.resetFields();
      this.selectedKeys = [];
      this.addCateForm.cat_pid = 0;
      this.addCateForm.cat_level = 0;
    },
    //展示修改分类的对话框
    showEditDialogVisible(cate) {
      this.editForm.cat_name = cate.cat_name;
      this.editForm.cat_id = cate.cat_id;
      this.editDialogVisible = true;
    },
    //修改商品分类名称
    editCate() {
      this.$refs.editFormRef.validate(valid => {
        if (!valid) return;
        this.$http
          .put("categories/" + this.editForm.cat_id, {
            cat_name: this.editForm.cat_name
          })
          .then(res => {
            if (res.data.meta.status !== 200)
              return this.$message.error("修改商品分类失败！");
            this.$message.success("修改商品分类成功！");
            this.editDialogVisible = false;
            this.getCateList();
          });
      });
    },
    //删除商品分类
    deleteCate(cate) {
      this.$confirm("此操作将永久删除该分类, 是否继续?", "提示", {
        confirmButtonText: "确定",
        cancelButtonText: "取消",
        type: "warning"
      }).then(() => {
        this.$http.delete('categories/'+cate.cat_id).then(res => {
          if(res.data.meta.status !== 200) return this.$message.error('删除分类失败！')
          this.$message.success('删除分类成功！')
          this.getCateList()
        })
      }).catch(() => {
        this.$message.error('取消删除分类！')
      })
    }
  }
};
</script>

<style lang="less" scoped>
.tree-table {
  margin-top: 15px;
}
.el-cascader {
  width: 100%;
}
</style>