const componentVues = import.meta.glob('@/views/**/*.vue')

const LAYOUT_PREFIX = 'layout.';
const VIEW_PREFIX = 'view.';
const FIRST_LEVEL_ROUTE_COMPONENT_SPLIT = '$';

//获取页面
export function getLayoutAndPage(component) {
  let layout = '';
  let page = '';

  const [layoutOrPage = '', pageItem = ''] = component.split(FIRST_LEVEL_ROUTE_COMPONENT_SPLIT) || [];

  layout = getLayout(layoutOrPage);
  page = getPage(pageItem || layoutOrPage);

  return { layout, page };
}

function getLayout(layout) {
  return layout.startsWith(LAYOUT_PREFIX) ? layout.replace(LAYOUT_PREFIX, '') : '';
}

function getPage(page) {
  return page.startsWith(VIEW_PREFIX) ? page.replace(VIEW_PREFIX, '') : '';
}

export function transformLayoutAndPageToComponent(layout, page) {
  const hasLayout = Boolean(layout);
  const hasPage = Boolean(page);

  if (hasLayout && hasPage) {
    return `${LAYOUT_PREFIX}${layout}${FIRST_LEVEL_ROUTE_COMPONENT_SPLIT}${VIEW_PREFIX}${page}`;
  }

  if (hasLayout) {
    return `${LAYOUT_PREFIX}${layout}`;
  }

  if (hasPage) {
    return `${VIEW_PREFIX}${page}`;
  }

  return '';
}

/**
 * Get route name by route path
 *
 * @param routeName
 */
export function getRoutePathByRouteName(routeName) {
  return `/${routeName.replace(/_/g, '/')}`;
}

/**
 * Get path param from route path
 *
 * @param routePath route path
 */
export function getPathParamFromRoutePath(routePath) {
  const [path, param = ''] = routePath.split('/:');

  return {
    path,
    param
  };
}

/**
 * Get route path with param
 *
 * @param routePath route path
 * @param param path param
 */
export function getRoutePathWithParam(routePath, param) {
  if (param.trim()) {
    return `${routePath}/:${param}`;
  }

  return routePath;
}

/**
 * 递归获取所有生成的路由组件路径
 */
/**
 * 获取所有视图组件选项
 * 使用 import.meta.glob 扫描 src/views 目录下的所有 .vue 文件
 */
export function getAllComponentOptions() {
  // 1. 扫描所有视图文件
  const componentVues = import.meta.glob('@/views/**/*.vue');
  
  // 2. 将路径转换为组件名称格式
  const components = Object.keys(componentVues).filter(key=>!key.includes("modules")).map(key => {
    /**
     * 路径处理逻辑：
     * 原始路径: /src/views/system/user/index.vue
     * 1. 去掉前缀: system/user/index.vue
     * 2. 去掉后缀: system/user/index
     * 3. 替换斜杠为下划线: system_user_index
     */
    const name = key
      .replace('/src/views/', '') // 去除基础路径
      .replace('.vue', '')        // 去除后缀
      .replace(/\//g, '_');       // 将 / 替换为 _ 以符合 view.xxx 的命名习惯

    return {
      label: name,
      value: name
    };
  });

  // 3. 排序并返回
  return components.sort((a, b) => a.label.localeCompare(b.label));
}
